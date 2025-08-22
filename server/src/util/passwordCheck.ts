// utility function to validate password strength
export default function isStrongPassword(password: string): boolean {
    // define minimum and maximum length
    const minLength = 8;
    const maxLength = 20;

    // regex patterns for validating the password

    // check for at least one uppercase letter
    const hasUpper = /[A-Z]/.test(password);

    // check for at least one lowercase letter
    const hasLower = /[a-z]/.test(password);

    // check for at least one digit
    const hasNumber = /[0-9]/.test(password);

    // check for at least one special character (non-alphanumeric)
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    // test the password against the patterns
    return (
        password.length >= minLength &&
        password.length <= maxLength &&
        hasUpper &&
        hasLower &&
        hasNumber &&
        hasSymbol
    );
}