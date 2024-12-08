export class Channel {
    id: string = '';
    title: string = '';
    messages: Array<string> = [];
    membersId: Array<string> = [];
    admin: string = '';
    description: string = '';
    isPublic: boolean = true;
    createdAt: string = '';

    constructor(init?: Partial<Channel>) {
        Object.assign(this, init);
    }
}