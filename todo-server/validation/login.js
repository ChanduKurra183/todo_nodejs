const loginSchema = {
    "required": ['email', 'password'],
    "type": 'object',
    "additionalProperties": false,
    "properties": {

        "email": {
            "type": "string",
            "format": "email"
        },
        "password": {
            "type": "string"
        }
    }
}

const getTaskSchema = {
    "required": ['user_id'],
    "type": 'object',
    "additionalProperties": false,
    "properties": {
        "user_id": {
            "type": "string",
            "format": "uuid"
        }
    }
}

const taskSchema = {
    "required": ['task_name', "date"],
    "type": 'object',
    "additionalProperties": false,
    "properties": {
        "task_name": {
            "type": "string"
        },
        "date": {
            "type": "string",
            "format": "date"
        }
    }
}

const updateTaskSchema = {
    "type": 'object',
    "additionalProperties": false,
    "required":["task_id"],
    "properties": {
        "task_id": {
            "type": "string"
        },
        "task_name": {
            "type": "string",
            "minLength": 1
        },
        "status": {
            "type": "string",
            "enum": ["Completed", "In Complete"]
        },
        "date": {
            "type": "string",
            "format": "date"
        }
    }
}

const registerUserSchema = {
    "required": ['user_name', "email", "password"],
    "type": 'object',
    "additionalProperties": false,
    "properties": {
        "user_name": {
            "type": "string",
            "minLength": 1
        },
        "email": {
            "type": "string",
            "format": "email"
        },
        "password": {
            "type": "string",
            "minLength": 6
        }
    }
}

const otpGenerationSchema = {
    "required": ["email", "password"],
    "type": 'object',
    "additionalProperties": false,
    "properties": {
        "email": {
            "type": "string",
            "format": "email"
        },
        "password": {
            "type": "string",
            "minLength": 6
        }
    }
}

const verifyOtpSchema = {
    "required": ["email", "otp"],
    "type": 'object',
    "additionalProperties": false,
    "properties": {
        "email": {
            "type": "string",
            "format": "email"
        },
        "otp": {
            "type": "integer",
            "minLength": 4,
            "maxLength": 4
        }
    }
}

const deleteTaskSchema = {
    "required": ['task_id'],
    "type": 'object',
    "additionalProperties": false,
    "properties": {
        "task_id": {
            "type": "string"
        }
    }
}

module.exports = { loginSchema, getTaskSchema, taskSchema, updateTaskSchema, registerUserSchema, verifyOtpSchema, otpGenerationSchema, deleteTaskSchema }