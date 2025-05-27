import { Role } from '../../users/enums/role.enum';
import { PermissionType } from '../authorization/permission.type';

export interface ActiveUserData {
  /**
   * The "subject" of the token. The value of this property is the user ID
   * that granted this token.
   */
  sub: number;

  /**
   * The subject's (user) email.
   */
  email: string;

  /**
   * The subject's (user) role.
   */
  role: Role;

  // NOTE: Having the "permissions" column in combination with "role"
  // likely does not make sense. It's just to showcase two diffrent
  // approaches to authorization.
  permissions: PermissionType[];
}
