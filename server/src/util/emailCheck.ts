// utility function to validate email format
export default function isValidEmail(email: string): boolean {
    // regex pattern for validating basic email structure
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    // test the input email against the pattern
    return emailPattern.test(email);
}