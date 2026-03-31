export class ResourcesError extends Error {
    constructor(message?: string) {
        super(message ?? "Resources error");
        this.name = "ResourcesError";
    }
}