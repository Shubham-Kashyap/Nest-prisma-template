import { capitalizeFirstLetterOnly } from './message.helper';

export const userFieldDescription = (fieldName: string) => {
    return `${capitalizeFirstLetterOnly(fieldName)} of the user`;
};

export const productFieldDescription = (fieldName: string) => {
    return `${capitalizeFirstLetterOnly(fieldName)} of the product`;
};
