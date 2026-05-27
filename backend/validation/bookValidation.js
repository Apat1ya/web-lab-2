function validateBookPayload(body, requireAllFields) {
    const requiredFields = ["title", "author", "price", "stock"];
    const allowedFields = [
        "title",
        "author",
        "price",
        "stock",
        "description",
        "imageUrl",
    ];

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "Request body must be an object");
    }

    if (requireAllFields) {
        for (const field of requiredFields) {
            if (body[field] === undefined || body[field] === null || body[field] === "") {
                throw httpError(400, `Field '${field}' is required`);
            }
        }
    }

    const payload = {};
    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            payload[field] = body[field];
        }
    }

    if (Object.keys(payload).length === 0) {
        throw httpError(400, "At least one book field is required");
    }

    validateString(payload, "title");
    validateString(payload, "author");
    validateString(payload, "description");
    validateString(payload, "imageUrl");

    if (payload.price !== undefined) {
        payload.price = Number(payload.price);
        if (!Number.isFinite(payload.price) || payload.price < 0) {
            throw httpError(400, "Field 'price' must be a positive number");
        }
    }

    if (payload.stock !== undefined) {
        payload.stock = Number(payload.stock);
        if (!Number.isInteger(payload.stock) || payload.stock < 0) {
            throw httpError(400, "Field 'stock' must be a positive integer");
        }
    }

    return payload;
}

function validateString(payload, field) {
    if (payload[field] !== undefined && typeof payload[field] !== "string") {
        throw httpError(400, `Field '${field}' must be a string`);
    }
}

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

module.exports = { validateBookPayload };
