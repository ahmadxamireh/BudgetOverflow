// utility function to validate names (letters, spaces, apostrophes, dots only)
export default function nameCheck(name: string): boolean {
    // [a-zA-Z'.]        allowed characters: letters, dot and apostrophe
    // (?: [a-zA-Z']+)*  allows optional spaces followed by more letters/apostrophes
    const regex = /^[A-Za-z'.]+(?: [A-Za-z'.]+)*$/;

    // must also be at least 2 characters long after trimming
    return name.trim().length >= 2 && regex.test(name);
}