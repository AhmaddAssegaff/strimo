import { AuthService } from '../auth.service';
import { loginResponseInterface } from '../auth.interface';

export type MockAuthService = jest.Mocked<Pick<AuthService, 'googleOauth'>>;

export type mockLoginResponse = loginResponseInterface;
