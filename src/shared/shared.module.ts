import { Module } from "@nestjs/common";
import { DrizzleService } from "./infra/database/drizzle/drizzle.service";

@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class SharedModule {}
