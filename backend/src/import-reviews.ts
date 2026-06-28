// Polyfill for Node.js 18
if (!global.crypto) {
    // @ts-ignore
    global.crypto = require('crypto');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './reviews/entities/review.entity';
import { Product } from './products/entities/product.entity';
import { User } from './users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';


// Helper: RFC 4180 CSV parser
function parseCSV(content: string): string[][] {
    const records: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                row.push(field);
                field = '';
            } else if (char === '\n' || char === '\r') {
                if (char === '\r' && nextChar === '\n') {
                    i++;
                }
                row.push(field);
                records.push(row);
                row = [];
                field = '';
            } else {
                field += char;
            }
        }
    }
    if (row.length > 0 || field !== '') {
        row.push(field);
        records.push(row);
    }
    return records;
}

// Clean and normalize titles for matching
function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/low-poly 3d model/gi, '')
        .replace(/3d model/gi, '')
        .replace(/low-poly/gi, '')
        .replace(/low poly/gi, '')
        .replace(/pack/gi, '')
        .replace(/and/gi, '&')
        .replace(/[\s\-_/–]+/g, ' ')
        .trim();
}

// Manual mapping for titles that normalize differently
const titleMapping: Record<string, string> = {
    'big pack interactive cartoon interiors and rooms': 'cartoon interactive rooms & furniture - cozy interior pack',
    'cartoon interactive rooms and furniture - cozy interior pack 2': 'cartoon interactive rooms & furniture - cozy interior pack',
    'low poly wild west set': 'wild west low poly set – buildings, landscapes & props',
    'fantasy islands modular pack': 'fantasy islands modular pack – stylized environments & exterior props',
    'low-poly medieval environment pack': 'low-poly medieval environment pack – buildings, landscapes & props',
    'low poly rooms interior': 'low poly rooms / interior',
    'low poly city pack': 'low poly city pack – buildings, roads & urban props',
    'low poly retro apartments interiors pack': 'low poly retro apartments interiors pack',
    'mega pack apartments interiors': 'mega pack apartments interiors low poly',
    'low poly exterior worlds': 'low poly exteriors worlds',
    'stylized italian pizza cities exteriors': 'stylized italian pizza cities - exteriors & buildings',
    'cartoon stores eateries islands exteriors': 'cartoon stores / eateries islands exteriors',
    'cartoon stores eateries islands exteriors 2': 'cartoon stores / eateries islands exteriors 2',
    'cartoon city islands exteriors': 'cartoon city islands / exteriors',
    'cartoon city islands exteriors 2': 'cartoon city islands / exteriors 2',
    'cartoon farm islands exteriors': 'cartoon farm islands / exteriors',
    'cartoon farm islands exteriors 2': 'cartoon farm islands / exteriors 2'
};

interface ExtractedReview {
    username: string;
    comment: string;
}

function parseReviews(reviewsText: string): ExtractedReview[] {
    if (!reviewsText || reviewsText.trim() === '') return [];

    const regex = /([a-zA-Z0-9\-_]+)(Buyer of this model|Returning buyer from this seller)/g;
    const matches: { username: string; status: string; index: number; length: number }[] = [];
    
    let match;
    while ((match = regex.exec(reviewsText)) !== null) {
        let username = match[1];
        const status = match[2];
        let index = match.index;
        let length = match[0].length;

        // If username starts with 'ago' (case insensitive), check if the text right before this match
        // ends with a pattern like '\d+\s*(?:month|year|day|week|hour|minute)s?\s*' (ignoring spaces).
        if (username.toLowerCase().startsWith('ago') && username.length > 3) {
            const beforeMatchText = reviewsText.substring(0, index);
            const timePattern = /\d+\s*(?:month|year|day|week|hour|minute)s?\s*$/i;
            if (timePattern.test(beforeMatchText)) {
                username = username.substring(3);
                index += 3;
                length -= 3;
            }
        }

        matches.push({
            username,
            status,
            index,
            length
        });
    }

    const results: ExtractedReview[] = [];

    for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i];
        const nextMatch = matches[i + 1];

        const startIdx = currentMatch.index + currentMatch.length;
        const endIdx = nextMatch ? nextMatch.index : reviewsText.length;

        let rawComment = reviewsText.substring(startIdx, endIdx);

        // Split by timestamp (if any) and take the first part to clean up copy-paste garbage
        const timeSplit = rawComment.split(/\d+\s*(?:month|year|day|week|hour|minute)s?\s*ago/i);
        let cleanComment = timeSplit[0].trim();

        // If the comment is empty or just buyer positive feedback template, skip it
        if (!cleanComment || cleanComment === 'The buyer left positive feedback on this model') {
            continue;
        }

        results.push({
            username: currentMatch.username,
            comment: cleanComment
        });
    }

    return results;
}

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const reviewRepository: Repository<Review> = app.get(getRepositoryToken(Review));
    const productRepository: Repository<Product> = app.get(getRepositoryToken(Product));
    const userRepository: Repository<User> = app.get(getRepositoryToken(User));

    console.log('--- 🚀 Starting Reviews Import ---');

    const csvPath = path.join(__dirname, '..', '..', 'content', 'reviews_from_cgtraders.csv');
    if (!fs.existsSync(csvPath)) {
        console.error(`❌ CSV file not found at ${csvPath}`);
        await app.close();
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const records = parseCSV(csvContent);
    
    // Fetch all products to match against
    const dbProducts = await productRepository.find();
    console.log(`📦 Loaded ${dbProducts.length} products from Database.`);

    // Helper to find product by title
    const findProduct = (csvTitle: string): Product | undefined => {
        const cleanCsvTitle = csvTitle.replace(/low-poly 3d model/gi, '').trim();
        const normCsvTitle = normalizeTitle(cleanCsvTitle);

        // Check manual mappings first (normalizing keys dynamically)
        for (const [csvKey, dbVal] of Object.entries(titleMapping)) {
            if (normalizeTitle(csvKey) === normCsvTitle) {
                const found = dbProducts.find(p => p.title.toLowerCase() === dbVal.toLowerCase());
                if (found) return found;
            }
        }

        // Try direct exact case-insensitive match
        let found = dbProducts.find(p => p.title.toLowerCase() === cleanCsvTitle.toLowerCase());
        if (found) return found;

        // Try normalized match
        found = dbProducts.find(p => normalizeTitle(p.title) === normCsvTitle);
        if (found) return found;

        return undefined;
    };

    // Dummy password hash for created reviewer users
    const dummyPasswordHash = await bcrypt.hash('cgtrader_temp_password_123', 10);

    let totalImported = 0;
    let totalSkippedDuplicates = 0;
    let totalSkippedMissingProduct = 0;

    // Skip the header row (records[0])
    for (let i = 1; i < records.length; i++) {
        const record = records[i];
        if (record.length < 3) continue;

        const csvTitle = record[1]?.trim();
        const reviewsText = record[2]?.trim();

        if (!csvTitle || !reviewsText) continue;

        const product = findProduct(csvTitle);
        if (!product) {
            console.warn(`⚠️ Product not found in DB: "${csvTitle}" (Skipped all reviews for it)`);
            totalSkippedMissingProduct += parseReviews(reviewsText).length;
            continue;
        }

        const extractedReviews = parseReviews(reviewsText);
        if (extractedReviews.length === 0) continue;

        console.log(`\n📝 Processing ${extractedReviews.length} reviews for: "${product.title}"`);

        // Fetch existing reviews for this product to prevent duplicates
        const existingReviews = await reviewRepository.find({
            where: { product: { id: product.id } },
            relations: ['user']
        });

        for (const extReview of extractedReviews) {
            // Check if comment already exists for this product (case-insensitive, trimmed)
            const isDuplicate = existingReviews.some(
                r => r.comment.trim().toLowerCase() === extReview.comment.trim().toLowerCase()
            );

            if (isDuplicate) {
                console.log(`  - ⏭️ Skipped duplicate review by ${extReview.username}: "${extReview.comment.substring(0, 30)}..."`);
                totalSkippedDuplicates++;
                continue;
            }

            // Find or create reviewer User
            const email = `${extReview.username.toLowerCase()}@cgtrader.temp`;
            let user = await userRepository.findOneBy({ email });
            if (!user) {
                user = userRepository.create({
                    email,
                    name: extReview.username,
                    passwordHash: dummyPasswordHash,
                    isAdmin: false,
                    termsAcceptedAt: new Date()
                });
                user = await userRepository.save(user);
                console.log(`  - 👤 Created temp user for reviewer: ${extReview.username}`);
            }

            // Create and save Review
            const newReview = reviewRepository.create({
                rating: 5,
                comment: extReview.comment,
                user,
                product
            });

            await reviewRepository.save(newReview);
            console.log(`  - ✅ Imported review from ${extReview.username}: "${extReview.comment.substring(0, 50)}..."`);
            totalImported++;
        }
    }

    console.log('\n--- 🎉 Import Summary ---');
    console.log(`✅ Successfully Imported: ${totalImported} reviews`);
    console.log(`⏭️ Skipped Duplicates:    ${totalSkippedDuplicates} reviews`);
    console.log(`⚠️ Skipped (No Product):  ${totalSkippedMissingProduct} reviews`);
    console.log('------------------------');

    await app.close();
}

bootstrap().catch(err => {
    console.error('❌ Critical error during bootstrap:', err);
});
