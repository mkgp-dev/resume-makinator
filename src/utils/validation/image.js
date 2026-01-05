const MAX_PROFILE_PICTURE_BYTES = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

export const validateProfileImage = (file) => {
    if (!file) return false;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) return false;
    if (file.size > MAX_PROFILE_PICTURE_BYTES) return false;
    return true;
};