class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [], // array of error so that any error comes in so we can push  it in
        stack = ""

    ){
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.data = null
        this.success = false
        this.errors = errors


        if(stack) {
            this.stack = stack
        }else {
            Error.captureStackTrace(this, this.constructor)
        }
     }
}

export  {ApiError};