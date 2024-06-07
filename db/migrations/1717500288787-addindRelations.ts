import { MigrationInterface, QueryRunner } from "typeorm";

export class AddindRelations1717500288787 implements MigrationInterface {
    name = 'AddindRelations1717500288787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_e516f42344dfb8d3938a5a0109a"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" RENAME COLUMN "userIdId" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_token" RENAME COLUMN "user_id" TO "userIdId"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_e516f42344dfb8d3938a5a0109a" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
