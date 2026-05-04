// Polyfill for Node.js 18
if (!global.crypto) {
    // @ts-ignore
    global.crypto = require('crypto');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const productsService = app.get(ProductsService);
    const usersService = app.get(UsersService);

    console.log('--- Seeding Database ---');

    // 1. Create Admin User
    const adminEmail = 'admin@mnostva.art';
    const existingAdmin = await usersService.findByEmail(adminEmail);
    if (!existingAdmin) {
        const password = 'admin123';
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        await usersService.create({
            email: adminEmail,
            name: 'Admin User',
            passwordHash,
            isAdmin: true,
            termsAcceptedAt: new Date(),
        });
        console.log('✅ Created admin user:', adminEmail);
    }

    // 2. Setup S3 SDK for Image Uploads
    const s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        forcePathStyle: true,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
    });
    const bucketName = process.env.R2_BUCKET_NAME || 'mnostva-assets';

    // 3. Process Scraped Items
    const scrapedDir = path.join(__dirname, '..', 'scraped_items');
    if (!fs.existsSync(scrapedDir)) {
        console.log('⚠️ scraped_items folder not found, skipping product seed.');
    } else {
        const files = fs.readdirSync(scrapedDir).filter(f => f.endsWith('.json'));
        console.log(`📦 Found ${files.length} scraped products. Processing...`);

        // Empty existing products first so no duplicates
        console.log('Clearing old products...');
        const oldProducts = await productsService.findAllProducts();
        for (const op of oldProducts) {
             try { await productsService.remove(op.id); } catch(e){}
        }

        for (let i = 0; i < files.length; i++) {
            const fileName = files[i];
            const filePath = path.join(scrapedDir, fileName);
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                
                let category = 'Full Pack';
                const lowerTitle = data.title.toLowerCase();
                if (lowerTitle.includes('room') || lowerTitle.includes('interior')) category = 'Room';
                if (lowerTitle.includes('exterior') || lowerTitle.includes('island') || lowerTitle.includes('city') || lowerTitle.includes('level')) category = 'Level';
                if (lowerTitle.includes('prop') || lowerTitle.includes('set')) category = 'Prop';

                // Parse Price (from string like "€268.89" or "Free" or "0")
                let priceCents = 0;
                if (data.price) {
                    const matches = data.price.match(/[\d,.]+/);
                    if (matches) {
                        const numeric = parseFloat(matches[0].replace(',', ''));
                        priceCents = Math.round(numeric * 100);
                    }
                }

                // Prepare Images
                let previewImageKey: string | null = null;
                const galleryImages: string[] = [];

                if (Array.isArray(data.images) && data.images.length > 0) {
                    // The rest should ONLY be from the "gallery_images" folder to avoid thumbnails
                    const pureGalleryImages = data.images.filter((img: string) => img.includes('/gallery_images/'));
                    const imagesToDownload = pureGalleryImages.length > 0 ? pureGalleryImages.slice(0, 6) : data.images.slice(0, 1);

                    console.log(`[${i+1}/${files.length}] Uploading ${imagesToDownload.length} images for: ${data.title}`);
                    
                    for (let imgIdx = 0; imgIdx < imagesToDownload.length; imgIdx++) {
                        const imgUrl = imagesToDownload[imgIdx];
                        try {
                            const res = await fetch(imgUrl);
                            if (res.ok) {
                                const buffer = Buffer.from(await res.arrayBuffer());
                                const ext = imgUrl.split('?')[0].split('.').pop() || 'jpg';
                                const key = `public/${uuidv4()}.${ext}`;
                                
                                await s3Client.send(new PutObjectCommand({
                                    Bucket: bucketName,
                                    Key: key,
                                    Body: buffer,
                                    ContentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
                                }));
                                
                                if (imgIdx === 0) {
                                    previewImageKey = key;
                                } else {
                                    galleryImages.push(key);
                                }
                            }
                        } catch (uploadErr) {
                            console.error(`Failed to upload image ${imgIdx} for ${data.title}:`, uploadErr);
                        }
                    }
                }

                // Infer Category from title
                // 1. Initialize parsing fields
                let cleanDescription = '';
                const features: string[] = [];
                const packContent: string[] = [];
                const compatibility: string[] = [];
                let polyCount = 'Unknown';
                let textures = 'Unknown';
                let rigged = false;
                let animated = false;

                // 2. Extract RAW text and split into lines
                const rawDesc = data.description || '';
                const lines = rawDesc.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

                let isTechnical = false;
                let isProps = false;
                
                const ignoreKeywords = [
                    'Overview', 'Reviews', 'Description', 'All packages by Mnostva Art',
                    'Enjoying the pack?', 'review from you would make our day',
                    'Follow us for for more great content', 'Email | Instagram | Tutorials',
                    'Questions? Reach out anytime', 'Show more', 'Distribution Method',
                    'Asset Package', 'Additional files', 'Show details', 'Tags', 'More from Mnostva Art', 'Items 0 to', 'Average rating'
                ];

                for (let j = 0; j < lines.length; j++) {
                    const line = lines[j];
                    const lowerLine = line.toLowerCase();

                    // Skip garbage lines
                    if (ignoreKeywords.some(kw => lowerLine.includes(kw.toLowerCase()))) continue;

                    // Detect sections
                    if (lowerLine.includes('technical details')) { isTechnical = true; isProps = false; continue; }
                    if (lowerLine.includes('props:') || lowerLine.includes('pack includes:')) { isProps = true; continue; }
                    if (lowerLine.includes('compatibility') || lowerLine.includes('included formats')) { isTechnical = true; continue; }
                    
                    // Technical specs parsing
                    if (lowerLine.includes('vertex count:') || lowerLine.includes('triangles')) {
                        polyCount = line.split(':').pop()?.trim() || line;
                        continue;
                    }
                    if (lowerLine.includes('texture resolutions:') || lowerLine.includes('textures:')) {
                        textures = line.split(':').pop()?.trim() || line;
                        continue;
                    }
                    if (lowerLine.includes('rigged: yes')) rigged = true;
                    if (lowerLine.includes('animated: yes')) animated = true;
                    
                    // Compatibility parsing
                    if (lowerLine.includes('files:')) {
                        const formats = line.replace('Files:', '').split('\\').map((f: string) => f.trim());
                        compatibility.push(...formats);
                        continue;
                    }
                    if (isTechnical && (lowerLine.includes('unreal') || lowerLine.includes('unity') || lowerLine.includes('blender') || lowerLine.includes('fbx') || lowerLine.includes('obj') || lowerLine.includes('gltf') || lowerLine.includes('windows'))) {
                        if (!compatibility.includes(line)) compatibility.push(line);
                        continue;
                    }

                    // Pack Content parsing
                    if (isProps && (line.includes('- ') || line.includes(' -') || line.includes('/') || line.match(/^\d+ (.*)/))) {
                        packContent.push(line.replace(/^[-\s*•]+/, '').trim());
                        continue;
                    }
                    
                    // Features and Description
                    if (line.match(/^[🌟🏠📦✅🔥]/) || line.includes('Included:')) {
                        features.push(line.replace(/^[🌟🏠📦✅🔥\s]+/, '').trim());
                    } else if (!isTechnical && !isProps) {
                        // General description logic
                        // Ignore short weird words
                        if (line.length > 10) {
                            cleanDescription += line + '\n\n';
                        }
                    }
                }

                if (compatibility.length === 0) compatibility.push('Unreal Engine', 'Unity', 'Blender', 'FBX', 'OBJ');
                if (packContent.length === 0) packContent.push('Many stylized assets');
                if (features.length === 0) features.push('Game-ready', 'Optimized', 'Stylized');

                // Fallback for polyCount if not specifically found but there's "k triangles" mention
                if (polyCount === 'Unknown') {
                    const match = rawDesc.match(/(\d+(?:[.,]\d+)?\s*k\s*triangles)/i);
                    if (match) polyCount = match[1];
                }

                // Try to extract sketchfab link if present in description text
                const sketchMatch = rawDesc.match(/sketchfab\.com\/(?:models\/|3d-models\/(?:[^\/]+-)?)([a-f0-9]{32})/i)
                    || rawDesc.match(/sketchfab\.com\/.*\/([a-f0-9]{32})/i);
                const sketchfabId = sketchMatch ? sketchMatch[1] : undefined;
                
                // Add optional external links
                const extLinks: any = { fab: data.sourceUrl };
                if (sketchfabId) extLinks.sketchfab = sketchfabId;

                await productsService.create({
                    title: data.title,
                    description: cleanDescription.trim() || 'No description available.',
                    price: priceCents,
                    fileKey: 'products/placeholder.zip', 
                    previewImageKey: previewImageKey || undefined,
                    category: category,
                    tags: data.tags || [category, 'Stylized', 'Low-Poly'],
                    features: features,
                    packContent: packContent,
                    compatibility: compatibility,
                    technicalSpecs: {
                        polyCount: polyCount,
                        textures: textures,
                        rigged: rigged,
                        animated: animated
                    },
                    galleryImages: galleryImages,
                    externalLinks: extLinks
                } as any);

                console.log(`✅ Saved product: ${data.title}`);
            } catch (err) {
                console.error(`❌ Failed to parse/save ${fileName}:`, err);
            }
        }
    }

    console.log('--- 🎉 Seeding Completed ---');
    await app.close();
}
bootstrap();
