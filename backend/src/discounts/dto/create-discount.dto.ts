import { IsString, IsInt, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class CreateDiscountDto {
    @IsString()
    name: string;

    @IsInt()
    @Min(0)
    @Max(100)
    percentage: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
