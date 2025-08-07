import { IPayload } from 'src/module/auth/types/payload/auth.payload';

export interface IAuthenticationRequest extends Request {
  user: IPayload;
}
