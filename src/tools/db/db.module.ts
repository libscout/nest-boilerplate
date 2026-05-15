import { Global, Module, type DynamicModule } from '@nestjs/common';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@src/tools/config';
import type { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

@Global()
@Module({})
export class DbModule {
  /**
   * Register the database connection globally.
   * Must be called once, typically in AppModule.
   */
  static register(): DynamicModule {
    return {
      module: DbModule,
      global: true,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
            type: 'postgres',
            host: config.getEnv('DB_HOST'),
            port: config.getEnv('DB_PORT'),
            username: config.getEnv('DB_USER'),
            password: config.getEnv('DB_PASSWORD'),
            database: config.getEnv('DB_DATABASE'),
            autoLoadEntities: true,
            synchronize: config.getEnv('DB_SCHEMA_SYNC') === 'true',
          }),
        }),
      ],
      exports: [TypeOrmModule],
    };
  }

  /**
   * Register entities for a specific feature module.
   * Delegates to TypeOrmModule.forFeature under the hood.
   */
  static forFeature(entities: EntityClassOrSchema[]): DynamicModule {
    return {
      module: DbModule,
      imports: [TypeOrmModule.forFeature(entities)],
      exports: [TypeOrmModule],
    };
  }
}
