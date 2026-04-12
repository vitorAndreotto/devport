import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { DevProfileModule } from './dev-profile/dev-profile.module.js';
import { LocationModule } from './location/location.module.js';
import { SkillTreeModule } from './skill-tree/skill-tree.module.js';
import { DevSkillModule } from './dev-skill/dev-skill.module.js';
import { ExperienceModule } from './experience/experience.module.js';
import { EducationModule } from './education/education.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: config.get<number>('THROTTLE_TTL', 60000),
            limit: config.get<number>('THROTTLE_LIMIT', 100),
          },
          {
            name: 'auth',
            ttl: config.get<number>('THROTTLE_AUTH_TTL', 60000),
            limit: config.get<number>('THROTTLE_AUTH_LIMIT', 10),
          },
        ],
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'devport'),
        password: config.get<string>('DB_PASSWORD', 'devport'),
        database: config.get<string>('DB_NAME', 'devport'),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: true,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
    }),

    UsersModule,
    AuthModule,
    DevProfileModule,
    LocationModule,
    SkillTreeModule,
    DevSkillModule,
    ExperienceModule,
    EducationModule,
  ],
})
export class AppModule {}
