"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const common_module_1 = require("./common/common.module");
const firebase_module_1 = require("./firebase/firebase.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const pets_module_1 = require("./pets/pets.module");
const matches_module_1 = require("./matches/matches.module");
const adoptions_module_1 = require("./adoptions/adoptions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: Number(process.env.THROTTLE_TTL) ?? 60000,
                    limit: Number(process.env.THROTTLE_LIMIT) ?? 150,
                },
            ]),
            common_module_1.CommonModule,
            firebase_module_1.FirebaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            pets_module_1.PetsModule,
            matches_module_1.MatchesModule,
            adoptions_module_1.AdoptionsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map