class Professor {
    constructor(token, name, email, website, associations, extra, location, phone, appointments) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.website = website;
        this.associations = associations;
        this.extra = extra;
        this.location = location;
        this.phone = phone;
        this.appointments = appointments;
    }
}

module.exports = Professor;