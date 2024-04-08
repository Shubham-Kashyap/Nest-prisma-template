import { fieldUpdated, invalidField, requiredField } from '@helpers/message.helper';

const COMMON_MESSGAES = {
    product: {
        notFound: 'Product with the specified id is not found'
    },
    cart: {
        emptyCart: 'The cart is empty. Please add products prior to performing updates'
    }
};

export const MESSAGES = {
    pagination: {
        error: {
            invalidParams: 'Invalid pagination params',
            minSize: 'Invalid pagination params: Max allowed size is 100'
        }
    },
    productFilter: {
        error: {
            invalidPriceRange: 'Invalid price range',
            invalidRating: 'Invalid rating rating'
        }
    },
    accessControl: {
        exception: {
            invalidToken: invalidField('Token'),
            tokenExpired: ' Token expired'
        }
    },
    signup: {
        success: 'Signup successfull',
        exception: {
            alreadyExsist: 'User with the specified email is already exsist',
            alreadyInUse: 'The phone number is already in use'
        },
        error: {
            firstName: {
                required: requiredField('First Name'),
                invalid: invalidField('First Name'),
                isString: 'First name must be string'
            },
            lastName: {
                required: requiredField('Last Name'),
                invalid: invalidField('Last Name'),
                isString: 'Last name must be string'
            },
            email: {
                required: requiredField('Email'),
                invalid: invalidField('Email'),
                verified: 'The email is not verified'
            },
            password: {
                required: requiredField('Password')
            }
        }
    },
    login: {
        success: 'Login Successfull',
        exception: {
            notFound: 'User not found',
            invalidCredentials: 'Invalid credentials',
            emailNotVerified: 'User email is not verified',
            PasswordsNotMatch: "Password entered by the user does'nt match"
        },
        error: {
            email: {
                invalid: invalidField('Email'),
                verified: 'The email is not verified'
            }
        }
    },
    userDetails: {
        success: 'User details are fetched successfully',
        error: {
            notFound: 'User with the specified id is not found'
        }
    },
    forgotPassword: {
        success: 'Forgot password link has been successfully sent to the email',
        error: {
            notVerified: 'User email is not verified'
        }
    },
    resetPassword: {
        success: fieldUpdated('Password')
    },
    deleteProduct: {
        success: 'Product has been Deleted successfully',
        error: {
            notFound: COMMON_MESSGAES.product.notFound
        }
    },
    editProduct: {
        success: 'Product has been edited successfully',
        error: {
            notFound: COMMON_MESSGAES.product.notFound
        }
    },
    getProduct: {
        success: 'Product has been fetched successfully',
        error: {
            notFound: COMMON_MESSGAES.product.notFound
        }
    },
    addToCart: {
        success: 'Product is successfully added to cart',
        error: {
            alreadyExsist: 'Product is already exsist in the cart'
        }
    },
    removeFromCart: {
        success: 'Product is successfully removed from cart',
        error: {
            notFound: COMMON_MESSGAES.cart.emptyCart
        }
    },
    updateCartItems: {
        success: 'Cart  is updated successfully',
        error: {
            notFound: COMMON_MESSGAES.cart.emptyCart
        }
    },
    createOrder: {
        success: 'Order is placed successfully',
        exception: {
            emptyCart: 'Please add items to cart first then checkout'
        }
    },
    userOrder: {
        success: 'user order list'
    }
};
