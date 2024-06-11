# Bitespeed API Documentation

This README provides documentation for the Bitespeed API. Below are the available endpoints and their corresponding methods, request bodies, and response structures.

## Identity Endpoint

-   Endpoint: `https://bitespeed-latest-rblg.onrender.com/identify`
-   Method: POST
-   Request Body:
    ```json
    {
        "phone_number": "string",
        "email": "string"
    }
    ```
-   Response:
    ```json
    {
        "data": {
            "contact": {
                "primaryContactId": [number],
                "emails": [string],
                "phoneNumbers": [string],
                "secondaryContactIds": [number]
            }
        },
        "status": number,
        "message": "string",
        "meta": {
            "error": boolean,
            "message": "string"
        }
    }
    ```

## Create Document Endpoint

-   Endpoint: `https://bitespeed-latest-rblg.onrender.com/create`
-   Method: POST
-   Request Body:
    ```json
    [
        {
            "phone_number": "string",
            "email": "string"
        }
    ]
    ```
-   Response:
    ```json
    {
        "data": {
            "contacts": [
                {
                    "primaryContactId": number,
                    "emails": [string],
                    "phone_numbers": [string],
                    "secondaryContactIds": [int]
                }
            ]
        },
        "status": number,
        "message": "string",
        "meta": {
            "error": boolean,
            "message": "string"
        }
    }
    ```

## Additional Information

-   Example of testing identity endpoint using curl:

    ```bash
    curl --location 'https://bitespeed-latest-rblg.onrender.com/identify' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "phone_number": "123456",
        "email": "mcfly@hillvalley.edu"
    }'
    ```

-   Example of adding contact using curl:

    ```bash
    curl --location 'https://bitespeed-latest-rblg.onrender.com/create' \
    --header 'Content-Type: application/json' \
    --data-raw '[
        {
            "phone_number": "123456",
            "email": "lorraine@hillvalley.edu"
        },
        {
            "phone_number": "123456",
            "email": "mcfly@hillvalley.edu"
        }
    ]'
    ```

-   Postman documentation: [https://documenter.getpostman.com/view/20345587/2sA3XMhhwM](https://documenter.getpostman.com/view/20345587/2sA3XMhhwM)
