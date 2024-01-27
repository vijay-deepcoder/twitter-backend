import JWT from "jsonwebtoken"
import {User} from "@apollo/server/src/plugin/schemaReporting/generated/operations";
import {JWTUser} from "../interfaces";

class jwtService {
    public static decodeToken(token: string) {
        return JWT.verify(token, 'mytokenisthis') as JWTUser;
    }

    static generateTokeForUser(user: User) {
        const payload = {id: user?.id, email: user?.email}

        const token = JWT.sign(payload, 'mytokenisthis')
        return token
    }
}

export default jwtService;
