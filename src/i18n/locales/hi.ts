const hi = {
    app: {
        hello: 'एप्लिकेशन सही तरीके से चल रही है।'
    },
    common: {
        success: 'सफल'
    },
    pagination: {
        error: {
            invalidParams: 'पेजिनेशन पैरामीटर्स अमान्य हैं',
            minSize: 'पेजिनेशन पैरामीटर्स अमान्य हैं: अधिकतम अनुमत साइज़ 100 है'
        }
    },
    productFilter: {
        error: {
            invalidPriceRange: 'प्राइस रेंज अमान्य है',
            invalidRating: 'रेटिंग अमान्य है'
        }
    },
    accessControl: {
        exception: {
            invalidToken: 'टोकन अमान्य है',
            tokenExpired: 'टोकन की अवधि समाप्त हो चुकी है'
        }
    },
    signup: {
        success: 'साइनअप सफल रहा',
        exception: {
            alreadyExists: 'इस ईमेल के साथ उपयोगकर्ता पहले से मौजूद है',
            alreadyInUse: 'फोन नंबर पहले से उपयोग में है'
        },
        error: {
            firstName: {
                required: 'फर्स्ट नेम फ़ील्ड आवश्यक है',
                invalid: 'फर्स्ट नेम अमान्य है',
                isString: 'फर्स्ट नेम स्ट्रिंग होना चाहिए'
            },
            lastName: {
                required: 'लास्ट नेम फ़ील्ड आवश्यक है',
                invalid: 'लास्ट नेम अमान्य है',
                isString: 'लास्ट नेम स्ट्रिंग होना चाहिए'
            },
            email: {
                required: 'ईमेल फ़ील्ड आवश्यक है',
                invalid: 'ईमेल अमान्य है',
                verified: 'ईमेल सत्यापित नहीं है'
            },
            password: {
                required: 'पासवर्ड फ़ील्ड आवश्यक है',
                invalid: 'पासवर्ड अमान्य है'
            }
        }
    },
    login: {
        success: 'लॉगिन सफल रहा',
        exception: {
            notFound: 'उपयोगकर्ता नहीं मिला',
            invalidCredentials: 'क्रेडेंशियल्स अमान्य हैं',
            emailNotVerified: 'उपयोगकर्ता का ईमेल सत्यापित नहीं है',
            PasswordsNotMatch: 'उपयोगकर्ता द्वारा दर्ज किया गया पासवर्ड मेल नहीं खाता'
        },
        error: {
            email: {
                invalid: 'ईमेल अमान्य है',
                verified: 'ईमेल सत्यापित नहीं है',
                required: 'ईमेल फ़ील्ड आवश्यक है'
            },
            password: {
                required: 'पासवर्ड फ़ील्ड आवश्यक है',
                invalid: 'पासवर्ड अमान्य है'
            }
        }
    },
    userDetails: {
        success: 'उपयोगकर्ता विवरण सफलतापूर्वक प्राप्त हुआ',
        error: {
            notFound: 'दी गई आईडी के लिए उपयोगकर्ता नहीं मिला'
        }
    },
    blockUser: {
        success: 'उपयोगकर्ता सफलतापूर्वक ब्लॉक हुआ',
        exception: {
            notFound: 'उपयोगकर्ता नहीं मिला'
        }
    },
    unblockUser: {
        success: 'उपयोगकर्ता सफलतापूर्वक अनब्लॉक हुआ',
        exception: {
            notFound: 'उपयोगकर्ता नहीं मिला'
        }
    },
    forgotPassword: {
        success: 'फॉरगॉट पासवर्ड लिंक सफलतापूर्वक ईमेल पर भेजा गया',
        error: {
            notVerified: 'उपयोगकर्ता का ईमेल सत्यापित नहीं है'
        }
    },
    resetPassword: {
        success: 'पासवर्ड अपडेट हो गया'
    },
    deleteProduct: {
        success: 'प्रोडक्ट सफलतापूर्वक डिलीट हुआ',
        error: {
            notFound: 'दी गई आईडी के साथ प्रोडक्ट नहीं मिला'
        }
    },
    editProduct: {
        success: 'प्रोडक्ट सफलतापूर्वक अपडेट हुआ',
        error: {
            notFound: 'दी गई आईडी के साथ प्रोडक्ट नहीं मिला'
        }
    },
    getProduct: {
        success: 'प्रोडक्ट सफलतापूर्वक प्राप्त हुआ',
        error: {
            notFound: 'दी गई आईडी के साथ प्रोडक्ट नहीं मिला'
        }
    },
    products: {
        list: {
            success: 'प्रोडक्ट्स की सूची'
        }
    },
    addToCart: {
        success: 'प्रोडक्ट सफलतापूर्वक कार्ट में जोड़ा गया',
        error: {
            alreadyExists: 'प्रोडक्ट पहले से कार्ट में मौजूद है'
        }
    },
    removeFromCart: {
        success: 'प्रोडक्ट सफलतापूर्वक कार्ट से हटाया गया',
        error: {
            notFound: 'कार्ट खाली है। कृपया पहले प्रोडक्ट्स जोड़ें'
        }
    },
    updateCartItems: {
        success: 'कार्ट सफलतापूर्वक अपडेट हुआ',
        error: {
            notFound: 'कार्ट खाली है। कृपया पहले प्रोडक्ट्स जोड़ें'
        }
    },
    createOrder: {
        success: 'ऑर्डर सफलतापूर्वक प्लेस हुआ',
        exception: {
            emptyCart: 'चेकआउट से पहले कार्ट में आइटम्स जोड़ें',
            shippingAddressRequired: 'शिपिंग पता आवश्यक है'
        }
    },
    userOrder: {
        success: 'उपयोगकर्ता ऑर्डर सूची',
        error: {
            notFound: 'दी गई आईडी के लिए ऑर्डर नहीं मिला'
        }
    }
};

export default hi;