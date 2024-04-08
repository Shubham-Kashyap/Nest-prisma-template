export const capitalizeFirstLetterOnly = (str: string) => {
    return str.charAt(0).toUpperCase().concat(str.slice(1).toLowerCase());
};

export const invalidField = (fieldName: string) => {
    return `Invalid ${fieldName.toLowerCase()}`;
};

export const requiredField = (fieldName: string) => {
    return `The ${fieldName.toLowerCase()} field is required`;
};

export const onlyStringField = (fieldName: string) => {
    return `${capitalizeFirstLetterOnly(fieldName)} must contain only alphabets`;
};

export const onlyNumericField = (fieldName: string) => {
    return `${capitalizeFirstLetterOnly(fieldName)} must contain only numeric values`;
};

export const fieldUpdated = (fieldName: string) => {
    return `${capitalizeFirstLetterOnly(fieldName)} updated`;
};

export const fieldCreated = (fieldName: string) => {
    return `${capitalizeFirstLetterOnly(fieldName)} created`;
};

export const fieldEnabled = (fieldName: string) => {
    return `${capitalizeFirstLetterOnly(fieldName)} has been enabled`;
};

export const fieldDisabled = (fieldName: string) => {
    return `${capitalizeFirstLetterOnly(fieldName)} has been disabled`;
};
