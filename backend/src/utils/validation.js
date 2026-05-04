const isValidEmail = (email) => {
    if (!email || typeof email !== 'string' || email.length > 254) return false;
    const atIndex = email.indexOf('@');
    if (atIndex < 1 || atIndex !== email.lastIndexOf('@')) return false;
    const domain = email.slice(atIndex + 1);
    const dotIndex = domain.lastIndexOf('.');
    if (dotIndex < 1 || dotIndex === domain.length - 1) return false;
    return true;
};

const isValidRole = (role) => {
    return ['Farmer', 'Expert', 'Admin'].includes(role);
};

module.exports = {
    isValidEmail,
    isValidRole
};
