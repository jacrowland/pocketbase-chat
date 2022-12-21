import { Record }  from "pocketbase";

export interface User extends Record {
    username: string;
    email: string;
    avatar: string;
    emailVisibility: boolean;
    verified: boolean;
}

export interface Server extends Record {
    name: string;
    createdBy: string;
}

export interface Channel extends Record {
    name: string;
    server: string;
    createdBy: string;
}

export interface Message extends Record {
    text: string;
    channel: string;
    user: string;
}

export interface Membership extends Record {
    user: string;
    server: string;
}