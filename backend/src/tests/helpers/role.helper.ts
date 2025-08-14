import { IRole } from '../../interfaces/user.interface';
import Role from '../../models/Role';

interface CreateRole {
  name?: string;
  permissions?: string[];
}

type CreateRoleInput = CreateRole | CreateRole[];

export const createTestRole = async (
  input: CreateRoleInput = {},
): Promise<IRole[]> => {
  const rolesToCreate = Array.isArray(input) ? input : [input];
  const createdRoles: IRole[] = [];

  for (const { name = 'REVIEWER', permissions = [] } of rolesToCreate) {
    let role = await Role.findOne({ name });
    role ??= await Role.create({ name, permissions });
    createdRoles.push(role);
  }

  return createdRoles;
};
