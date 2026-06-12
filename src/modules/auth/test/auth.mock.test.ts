import { AuthService } from '../auth.service';
import { loginResponseInterface } from '../jwt.interface';

export type MockAuthService = jest.Mocked<
  Pick<
    AuthService,
    | 'login'
    | 'register'
    | 'refreshToken'
    | 'requestEmailVerification'
    | 'confirmEmailVerification'
  >
>;

export type mockLoginResponse = loginResponseInterface;
