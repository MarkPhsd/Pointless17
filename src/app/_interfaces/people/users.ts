export interface IUser {
    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    authdata?: string;
    resetCode?: string;
    email: string;
    sourceURL: string;
    token: string;
    phone: string;
    roles: string;
    type:  string;
    message: string;
    employeeID: number;
    metrcUser: string;
    metrcKey: string;
}
