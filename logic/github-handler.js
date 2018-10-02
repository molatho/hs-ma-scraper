var GitHub = requre("github-api");

class GithubHandler {
    constructor(token, folder, user, repo) {
        this.gh = new GitHub({
            token: token
        });
        this.user = this.gh.getUser();
    }
}