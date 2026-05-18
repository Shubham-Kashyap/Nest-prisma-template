const en = {
    app: {
        hello: 'The application is working fine..'
    },
    common: {
        success: 'Success'
    },
    pagination: {
        error: {
            invalidParams: 'Invalid pagination params',
            minSize: 'Invalid pagination params: Max allowed size is 100'
        }
    },
    productFilter: {
        error: {
            invalidPriceRange: 'Invalid price range',
            invalidRating: 'Invalid rating'
        }
    },
    accessControl: {
        exception: {
            invalidToken: 'Invalid token',
            tokenExpired: 'Token expired'
        }
    },
    signup: {
        success: 'Signup successful',
        exception: {
            alreadyExists: 'User with the specified email already exists',
            alreadyInUse: 'The phone number is already in use'
        },
        error: {
            firstName: {
                required: 'The first name field is required',
                invalid: 'Invalid first name',
                isString: 'First name must be string'
            },
            lastName: {
                required: 'The last name field is required',
                invalid: 'Invalid last name',
                isString: 'Last name must be string'
            },
            email: {
                required: 'The email field is required',
                invalid: 'Invalid email',
                verified: 'The email is not verified'
            },
            password: {
                required: 'The password field is required',
                invalid: 'Invalid password'
            }
        }
    },
    login: {
        success: 'Login Successful',
        exception: {
            notFound: 'User not found',
            invalidCredentials: 'Invalid credentials',
            emailNotVerified: 'User email is not verified',
            PasswordsNotMatch: "Password entered by the user doesn't match"
        },
        error: {
            email: {
                invalid: 'Invalid email',
                verified: 'The email is not verified',
                required: 'The email field is required'
            },
            password: {
                required: 'The password field is required',
                invalid: 'Invalid password'
            }
        }
    },
    userDetails: {
        success: 'User details are fetched successfully',
        error: {
            notFound: 'User with the specified id is not found'
        }
    },
    blockUser: {
        success: 'User is blocked successfully',
        exception: {
            notFound: 'User not found'
        }
    },
    unblockUser: {
        success: 'User is unblocked successfully',
        exception: {
            notFound: 'User not found'
        }
    },
    forgotPassword: {
        success: 'Forgot password link has been successfully sent to the email',
        error: {
            notVerified: 'User email is not verified'
        }
    },
    resetPassword: {
        success: 'Password updated'
    },
    deleteProduct: {
        success: 'Product has been Deleted successfully',
        error: {
            notFound: 'Product with the specified id is not found'
        }
    },
    editProduct: {
        success: 'Product has been edited successfully',
        error: {
            notFound: 'Product with the specified id is not found'
        }
    },
    getProduct: {
        success: 'Product has been fetched successfully',
        error: {
            notFound: 'Product with the specified id is not found'
        }
    },
    products: {
        list: {
            success: 'Products list'
        }
    },
    addToCart: {
        success: 'Product is successfully added to cart',
        error: {
            alreadyExists: 'Product already exists in the cart'
        }
    },
    removeFromCart: {
        success: 'Product is successfully removed from cart',
        error: {
            notFound: 'The cart is empty. Please add products prior to performing updates'
        }
    },
    updateCartItems: {
        success: 'Cart is updated successfully',
        error: {
            notFound: 'The cart is empty. Please add products prior to performing updates'
        }
    },
    createOrder: {
        success: 'Order is placed successfully',
        exception: {
            emptyCart: 'Please add items to cart first then checkout',
            shippingAddressRequired: 'Shipping address is required'
        }
    },
    userOrder: {
        success: 'User order list',
        error: {
            notFound: 'Order with the specified id is not found'
        }
    }
};

export default en;
