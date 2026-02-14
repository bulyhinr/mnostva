import { IsString, IsNumber, IsOptional, IsArray, IsObject, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TechnicalSpecsDto {
    @IsString()
    @IsOptional()
    polyCount?: string;

    @IsString()
    @IsOptional()
    textures?: string;

    @IsBoolean()
    @IsOptional()
    rigged?: boolean;

    @IsBoolean()
    @IsOptional()
    animated?: boolean;
}

class ExternalLinksDto {
    @IsString()
    @IsOptional()
    unity?: string;

    @IsString()
    @IsOptional()
    fab?: string;

    @IsString()
    @IsOptional()
    cgtrader?: string;

    @IsString()
    @IsOptional()
    artstation?: string;
}

export class CreateProductDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    price: number;

    @IsString()
    fileKey: string;

    @IsString()
    @IsOptional()
    previewImageKey?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    galleryImages?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    features?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    packContent?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    compatibility?: string[];

    @IsObject()
    @ValidateNested()
    @Type(() => TechnicalSpecsDto)
    @IsOptional()
    technicalSpecs?: TechnicalSpecsDto;

    @IsObject()
    @ValidateNested()
    @Type(() => ExternalLinksDto)
    @IsOptional()
    externalLinks?: ExternalLinksDto;

    @IsString()
    @IsOptional()
    discountId?: string;
}

export class UpdateProductDto extends CreateProductDto { }
