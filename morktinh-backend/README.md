# Morktinh Backend

Morktinh backend is a Django REST Framework API for user authentication, customer management, product catalog management, product media, variants, tags, banners, and discounts.

The API is mounted under:

```text
http://localhost:8000/api/
```

Admin is mounted under:

```text
http://localhost:8000/admin/
```

## Tech Stack

- Python
- Django
- Django REST Framework
- Simple JWT
- PostgreSQL
- django-cors-headers
- Pillow for image uploads
- django-cleanup for file cleanup

## Project Structure

```text
morktinh-backend/
  apps/
    products/
      models.py
      serializers.py
      views.py
      urls.py
      tests.py
    users/
      models.py
      serializers.py
      views.py
      urls.py
      permissions.py
      utils.py
  setting/
    settings.py
    urls.py
    wsgi.py
    asgi.py
  media/
  manage.py
  requirements.txt
```

## Local Setup

Create and activate a virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\activate
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Create a PostgreSQL database and copy `.env.example` to `.env`. Configure:

```text
POSTGRES_DB=morktinh
POSTGRES_USER=morktinh
POSTGRES_PASSWORD=change-this-database-password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

Run migrations:

```powershell
python manage.py migrate
```

Docker Compose starts PostgreSQL automatically:

```powershell
docker compose up --build
```

Create an admin user:

```powershell
python manage.py createsuperuser
```

Run the backend:

```powershell
python manage.py runserver
```

Run product tests:

```powershell
.\venv\Scripts\python.exe manage.py test apps.products.tests
```

## Configuration

Main settings live in `setting/settings.py`.

Important settings:

```python
AUTH_USER_MODEL = 'users.User'
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
```

PostgreSQL connection settings are read from the `POSTGRES_*` environment
variables shown in the local setup section.

JWT uses Bearer auth:

```http
Authorization: Bearer <access_token>
```

CORS currently allows local frontend origins:

```text
http://localhost:5173
http://localhost:3000
http://localhost:3001
http://127.0.0.1:9000
```

Security note: production should move secret keys, email credentials, debug mode, allowed hosts, and database config into environment variables.

## Authentication Flow

The backend uses a custom `User` model with email login. Users must verify their email through OTP before login.

Basic flow:

```text
register -> send OTP -> verify OTP -> login -> use JWT access token
```

Roles:

```text
customer
admin
```

Admin-only APIs check:

```python
request.user.is_authenticated and request.user.role == "admin"
```

## Users Data Model

### User

Database table: `users`

Fields:

```text
id
email
password
first_name
last_name
phone
profile_picture
is_email_verified
is_active
role
is_staff
is_superuser
last_login
```

Notes:

- `email` is the login field.
- `role=admin` automatically sets `is_staff=True`.
- `role=customer` sets `is_staff=False`.

### CustomerProfile

Database table: `customers_profiles`

Fields:

```text
id
user
register_type
google_id
google_avatar
```

Created automatically during email registration with:

```text
register_type=email
```

### CustomerAddress

Database table: `customer_address`

Fields:

```text
id
customer
recipient_name
address_line1
address_line2
phone
city
district
commune
```

### OTP

Database table: `otps`

Fields:

```text
id
user
code
purpose
is_used
expires_at
created_at
used_at
```

OTP purposes:

```text
email_verification
password_reset
login
```

Current OTP expiry:

```text
2 minutes
```

## User API

Base path:

```text
/api/users/
```

### Register

```http
POST /api/users/auth/register/
```

Request:

```json
{
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "012345678",
  "password": "password123",
  "password_confirm": "password123"
}
```

Success response:

```json
{
  "message": "Registration successful. Please verify your email."
}
```

Behavior:

- Creates a customer user.
- Hashes password.
- Creates `CustomerProfile`.
- User cannot login until email is verified.

### Send OTP

```http
POST /api/users/auth/send-otp/
```

Request:

```json
{
  "email": "customer@example.com",
  "purpose": "email_verification"
}
```

Success response:

```json
{
  "message": "OTP sent successfully.",
  "expires_at": "2026-06-10T08:00:00Z"
}
```

Behavior:

- Requires existing email.
- Refuses if email is already verified.
- Generates a 6-digit OTP.
- Sends OTP by email.
- Uses anonymous throttling to reduce spam.

### Verify OTP

```http
POST /api/users/auth/verify-otp/
```

Request:

```json
{
  "email": "customer@example.com",
  "code": "123456",
  "purpose": "email_verification"
}
```

Success response:

```json
{
  "message": "Email verified successfully! You can now log in."
}
```

Behavior:

- Checks OTP code, purpose, user, unused state, and expiry.
- Marks OTP as used.
- Sets `user.is_email_verified=True`.

### Login

```http
POST /api/users/auth/login/
```

Request:

```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

Success response:

```json
{
  "message": "Login successful.",
  "refresh": "<refresh_token>",
  "access": "<access_token>",
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  }
}
```

Login requires:

- Correct email and password.
- `is_email_verified=True`.
- `is_active=True`.

### Customer Management

Admin-only endpoint:

```http
GET    /api/users/management/customers/
POST   /api/users/management/customers/
GET    /api/users/management/customers/{id}/
PUT    /api/users/management/customers/{id}/
PATCH  /api/users/management/customers/{id}/
DELETE /api/users/management/customers/{id}/
```

Auth header:

```http
Authorization: Bearer <admin_access_token>
```

Create request:

```json
{
  "email": "staff@example.com",
  "first_name": "Staff",
  "last_name": "User",
  "phone": "012345678",
  "role": "customer",
  "password": "password123",
  "password_confirm": "password123"
}
```

Important rule:

- Only superusers can create or assign `role=admin`.

## Products Data Model

### Category

Database table: `categories`

Fields:

```text
id
name
image
slug
is_active
created_at
updated_at
```

Notes:

- `slug` is auto-generated from `name`.
- Public listing hides inactive categories.

### Brand

Database table: `brands`

Fields:

```text
id
name
image
slug
is_active
created_at
updated_at
```

Notes:

- `slug` is auto-generated from `name`.
- Public listing hides inactive brands.

### Banner

Database table: `banners`

Fields:

```text
id
banner_image
title
description
button_title
button_color
is_active
order
```

Ordering:

```text
order ascending
```

### Discount

Database table: `discounts`

Fields:

```text
id
name
discount_type
value
is_global
override_product_discount
is_active
start_date
end_date
```

Discount types:

```text
percent
fixed
```

### ProductTag

Database table: `product_tags`

Fields:

```text
id
name
slug
is_active
created_at
updated_at
```

Notes:

- `slug` is auto-generated from `name`.
- Tags are managed entities, not free text.
- Public tag list hides inactive tags.

### Product

Database table: `products`

Fields:

```text
id
category
brand
discounts
tags
name
slug
description
detail
base_price
specification
is_active
is_feature
created_at
updated_at
```

Relations:

```text
category -> Category
brand -> Brand
discounts -> many Discount
tags -> many ProductTag
medias -> many ProductMedia
videos -> many ProductVideo
option_groups -> many ProductOptionGroup
variants -> many ProductVariant
free_items -> many ProductFreeItem
```

Notes:

- `slug` is auto-generated from `name`.
- Public product listing hides inactive products, inactive categories, and inactive brands.
- Product list response is lighter than product detail response.

### ProductMedia

Database table: `product_medias`

Fields:

```text
id
product
image
is_thumbnail
```

### ProductVideo

Database table: `product_videos`

Fields:

```text
id
product
video_url
is_main
```

### ProductOptionGroup

Database table: `product_option_groups`

Fields:

```text
id
product
title
```

Examples:

```text
Color
Storage
Size
RAM
```

### ProductOption

Database table: `product_options`

Fields:

```text
id
group
value
```

Examples:

```text
Red
Blue
128GB
256GB
```

### ProductVariant

Database table: `product_variants`

Fields:

```text
id
product
sku
stock
price
image
is_active
created_at
updated_at
```

Computed serializer field:

```text
variant_final_price
```

### VariantOption

Database table: `variant_options`

Fields:

```text
id
variant
option
```

Constraint:

```text
variant + option must be unique
```

### ProductFreeItem

Database table: `product_free_items`

Fields:

```text
id
product
name
image
is_active
```

## Product API

Base path:

```text
/api/products/
```

All product routes are registered by DRF `DefaultRouter`, so each resource gets list, create, detail, update, partial update, and delete routes.

### Resource Endpoints

```http
GET    /api/products/categories/
POST   /api/products/categories/
GET    /api/products/categories/{id}/
PUT    /api/products/categories/{id}/
PATCH  /api/products/categories/{id}/
DELETE /api/products/categories/{id}/

GET    /api/products/brands/
POST   /api/products/brands/
GET    /api/products/brands/{id}/
PUT    /api/products/brands/{id}/
PATCH  /api/products/brands/{id}/
DELETE /api/products/brands/{id}/

GET    /api/products/banners/
POST   /api/products/banners/
GET    /api/products/banners/{id}/
PUT    /api/products/banners/{id}/
PATCH  /api/products/banners/{id}/
DELETE /api/products/banners/{id}/

GET    /api/products/discounts/
POST   /api/products/discounts/
GET    /api/products/discounts/{id}/
PUT    /api/products/discounts/{id}/
PATCH  /api/products/discounts/{id}/
DELETE /api/products/discounts/{id}/

GET    /api/products/tags/
POST   /api/products/tags/
GET    /api/products/tags/{id}/
PUT    /api/products/tags/{id}/
PATCH  /api/products/tags/{id}/
DELETE /api/products/tags/{id}/

GET    /api/products/products/
POST   /api/products/products/
GET    /api/products/products/{id}/
PUT    /api/products/products/{id}/
PATCH  /api/products/products/{id}/
DELETE /api/products/products/{id}/

GET    /api/products/product-medias/
GET    /api/products/product-videos/
GET    /api/products/option-groups/
GET    /api/products/options/
GET    /api/products/variants/
GET    /api/products/variant-options/
GET    /api/products/free-items/
```

The media, video, option, variant, variant-option, and free-item routes also support normal DRF create/update/delete methods.

## Detailed Endpoint Reference

Unless a route says otherwise:

- `GET` list returns an array.
- `GET {id}` returns one object.
- `POST` creates and returns the created object.
- `PUT {id}` replaces the object and returns the updated object.
- `PATCH {id}` partially updates the object and returns the updated object.
- `DELETE {id}` returns `204 No Content`.
- Image upload endpoints should use `multipart/form-data`.

### Common Error Responses

Validation error:

```json
{
  "field_name": ["This field is required."]
}
```

Object not found:

```json
{
  "detail": "No Product matches the given query."
}
```

Invalid or missing JWT on protected endpoints:

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### `POST /api/users/auth/register/`

Auth: public

Creates a customer account. The user must verify email before login.

Request:

```json
{
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "012345678",
  "password": "password123",
  "password_confirm": "password123"
}
```

Success `201 Created`:

```json
{
  "message": "Registration successful. Please verify your email."
}
```

Validation examples:

```json
{
  "non_field_errors": ["Passwords do not match."]
}
```

```json
{
  "email": ["user with this email already exists."]
}
```

### `POST /api/users/auth/send-otp/`

Auth: public

Sends a 6-digit OTP to the user's email.

Request:

```json
{
  "email": "customer@example.com",
  "purpose": "email_verification"
}
```

Allowed `purpose` values:

```text
email_verification
password_reset
login
```

Success `200 OK`:

```json
{
  "message": "OTP sent successfully.",
  "expires_at": "2026-06-10T08:02:00Z"
}
```

Validation examples:

```json
{
  "email": ["User with this email does not exist"]
}
```

```json
{
  "email": ["Email is already verified."]
}
```

### `POST /api/users/auth/verify-otp/`

Auth: public

Verifies OTP, marks it as used, and sets the user's email as verified.

Request:

```json
{
  "email": "customer@example.com",
  "code": "123456",
  "purpose": "email_verification"
}
```

Success `200 OK`:

```json
{
  "message": "Email verified successfully! You can now log in."
}
```

Validation example:

```json
{
  "non_field_errors": ["Invalid or expired OTP code."]
}
```

### `POST /api/users/auth/login/`

Auth: public

Logs in a verified active user and returns Simple JWT tokens.

Request:

```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

Success `200 OK`:

```json
{
  "message": "Login successful.",
  "refresh": "refresh.jwt.token",
  "access": "access.jwt.token",
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  }
}
```

Validation examples:

```json
{
  "non_field_errors": ["Invalid email or password."]
}
```

```json
{
  "non_field_errors": ["Please verify your email address before logging in."]
}
```

### `/api/users/management/customers/`

Auth: admin JWT required

Headers:

```http
Authorization: Bearer <admin_access_token>
```

#### `GET /api/users/management/customers/`

Returns all users ordered by `id`.

Success `200 OK`:

```json
[
  {
    "id": 1,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "012345678",
    "role": "customer"
  }
]
```

#### `POST /api/users/management/customers/`

Creates a user from the admin panel/API.

Request:

```json
{
  "email": "staff@example.com",
  "first_name": "Staff",
  "last_name": "User",
  "phone": "012345678",
  "role": "customer",
  "password": "password123",
  "password_confirm": "password123"
}
```

Success `201 Created`:

```json
{
  "id": 2,
  "email": "staff@example.com",
  "first_name": "Staff",
  "last_name": "User",
  "phone": "012345678",
  "role": "customer"
}
```

Notes:

- `password` is required on create.
- `password_confirm` must match `password`.
- Only superusers can create or assign `role=admin`.

#### `GET /api/users/management/customers/{id}/`

Success `200 OK`:

```json
{
  "id": 2,
  "email": "staff@example.com",
  "first_name": "Staff",
  "last_name": "User",
  "phone": "012345678",
  "role": "customer"
}
```

#### `PATCH /api/users/management/customers/{id}/`

Request:

```json
{
  "first_name": "Updated",
  "phone": "099999999"
}
```

Success `200 OK`:

```json
{
  "id": 2,
  "email": "staff@example.com",
  "first_name": "Updated",
  "last_name": "User",
  "phone": "099999999",
  "role": "customer"
}
```

#### `PUT /api/users/management/customers/{id}/`

Full update request:

```json
{
  "email": "staff@example.com",
  "first_name": "Updated",
  "last_name": "User",
  "phone": "099999999",
  "role": "customer"
}
```

Success response shape is the same as `PATCH`.

#### `DELETE /api/users/management/customers/{id}/`

Success:

```text
204 No Content
```

### `/api/products/categories/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

#### `GET /api/products/categories/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "name": "Phones",
    "image": "http://localhost:8000/media/categories/phones.png",
    "slug": "phones",
    "is_active": true,
    "created_at": "2026-06-10T08:00:00Z",
    "updated_at": "2026-06-10T08:00:00Z"
  }
]
```

Public users only receive active categories.

#### `POST /api/products/categories/`

Use `multipart/form-data` when uploading `image`.

Request:

```json
{
  "name": "Phones",
  "image": "<file>",
  "is_active": true
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "name": "Phones",
  "image": "http://localhost:8000/media/categories/phones.png",
  "slug": "phones",
  "is_active": true,
  "created_at": "2026-06-10T08:00:00Z",
  "updated_at": "2026-06-10T08:00:00Z"
}
```

Read-only fields:

```text
id
slug
created_at
updated_at
```

#### `GET /api/products/categories/{id}/`

Success response is one category object.

#### `PATCH /api/products/categories/{id}/`

Request:

```json
{
  "name": "Smartphones",
  "is_active": false
}
```

Success response is the updated category object.

#### `PUT /api/products/categories/{id}/`

Full update request:

```json
{
  "name": "Smartphones",
  "image": "<file>",
  "is_active": true
}
```

Success response is the updated category object.

#### `DELETE /api/products/categories/{id}/`

Success:

```text
204 No Content
```

### `/api/products/brands/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

Brand fields are the same pattern as categories:

```text
id
name
image
slug
is_active
created_at
updated_at
```

#### `GET /api/products/brands/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "name": "Apple",
    "image": "http://localhost:8000/media/brands/apple.png",
    "slug": "apple",
    "is_active": true,
    "created_at": "2026-06-10T08:00:00Z",
    "updated_at": "2026-06-10T08:00:00Z"
  }
]
```

#### `POST /api/products/brands/`

Request:

```json
{
  "name": "Apple",
  "image": "<file>",
  "is_active": true
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "name": "Apple",
  "image": "http://localhost:8000/media/brands/apple.png",
  "slug": "apple",
  "is_active": true,
  "created_at": "2026-06-10T08:00:00Z",
  "updated_at": "2026-06-10T08:00:00Z"
}
```

`GET {id}`, `PATCH {id}`, `PUT {id}`, and `DELETE {id}` follow the same pattern as categories.

### `/api/products/banners/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

#### `GET /api/products/banners/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "banner_image": "http://localhost:8000/media/banners/banner.png",
    "title": "Summer Sale",
    "description": "Save on selected products",
    "button_title": "Shop Now",
    "button_color": "#111111",
    "is_active": true,
    "order": 1
  }
]
```

#### `POST /api/products/banners/`

Use `multipart/form-data`.

Request:

```json
{
  "banner_image": "<file>",
  "title": "Summer Sale",
  "description": "Save on selected products",
  "button_title": "Shop Now",
  "button_color": "#111111",
  "is_active": true,
  "order": 1
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "banner_image": "http://localhost:8000/media/banners/banner.png",
  "title": "Summer Sale",
  "description": "Save on selected products",
  "button_title": "Shop Now",
  "button_color": "#111111",
  "is_active": true,
  "order": 1
}
```

`GET {id}`, `PATCH {id}`, `PUT {id}`, and `DELETE {id}` follow the same response shape.

### `/api/products/discounts/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

#### `GET /api/products/discounts/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "name": "New Year Sale",
    "discount_type": "percent",
    "value": "10.00",
    "is_global": false,
    "override_product_discount": false,
    "is_active": true,
    "start_date": "2026-06-10T08:00:00Z",
    "end_date": "2026-06-20T08:00:00Z"
  }
]
```

Public users only receive active discounts.

#### `POST /api/products/discounts/`

Request:

```json
{
  "name": "New Year Sale",
  "discount_type": "percent",
  "value": "10.00",
  "is_global": false,
  "override_product_discount": false,
  "is_active": true,
  "start_date": "2026-06-10T08:00:00Z",
  "end_date": "2026-06-20T08:00:00Z"
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "name": "New Year Sale",
  "discount_type": "percent",
  "value": "10.00",
  "is_global": false,
  "override_product_discount": false,
  "is_active": true,
  "start_date": "2026-06-10T08:00:00Z",
  "end_date": "2026-06-20T08:00:00Z"
}
```

Allowed `discount_type` values:

```text
percent
fixed
```

`GET {id}`, `PATCH {id}`, `PUT {id}`, and `DELETE {id}` follow the same response shape.

### `/api/products/tags/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

#### `GET /api/products/tags/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "name": "New",
    "slug": "new",
    "is_active": true,
    "created_at": "2026-06-10T08:00:00Z",
    "updated_at": "2026-06-10T08:00:00Z"
  }
]
```

Public users only receive active tags.

#### `POST /api/products/tags/`

Request:

```json
{
  "name": "New",
  "is_active": true
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "name": "New",
  "slug": "new",
  "is_active": true,
  "created_at": "2026-06-10T08:00:00Z",
  "updated_at": "2026-06-10T08:00:00Z"
}
```

Read-only fields:

```text
id
slug
created_at
updated_at
```

`GET {id}`, `PATCH {id}`, `PUT {id}`, and `DELETE {id}` follow the same response shape.

### `/api/products/products/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

#### `GET /api/products/products/`

Returns lightweight product cards.

Success `200 OK`:

```json
[
  {
    "id": 1,
    "category": 1,
    "category_detail": {
      "id": 1,
      "name": "Phones",
      "image": "http://localhost:8000/media/categories/phones.png",
      "slug": "phones",
      "is_active": true,
      "created_at": "2026-06-10T08:00:00Z",
      "updated_at": "2026-06-10T08:00:00Z"
    },
    "brand": 1,
    "brand_detail": {
      "id": 1,
      "name": "Apple",
      "image": "http://localhost:8000/media/brands/apple.png",
      "slug": "apple",
      "is_active": true,
      "created_at": "2026-06-10T08:00:00Z",
      "updated_at": "2026-06-10T08:00:00Z"
    },
    "discounts": [1],
    "discount_details": [
      {
        "id": 1,
        "name": "Phone Sale",
        "discount_type": "percent",
        "value": "10.00",
        "is_global": false,
        "override_product_discount": false,
        "is_active": true,
        "start_date": "2026-06-10T08:00:00Z",
        "end_date": "2026-06-20T08:00:00Z"
      }
    ],
    "tags": [1],
    "tag_details": [
      {
        "id": 1,
        "name": "New",
        "slug": "new",
        "is_active": true,
        "created_at": "2026-06-10T08:00:00Z",
        "updated_at": "2026-06-10T08:00:00Z"
      }
    ],
    "name": "iPhone 15",
    "slug": "iphone-15",
    "base_price": "1000.00",
    "final_price": "900.00",
    "is_active": true,
    "is_feature": true,
    "created_at": "2026-06-10T08:00:00Z",
    "updated_at": "2026-06-10T08:00:00Z",
    "medias": [
      {
        "id": 1,
        "product": 1,
        "image": "http://localhost:8000/media/products/iphone.png",
        "is_thumbnail": true
      }
    ],
    "variants_count": 2
  }
]
```

Useful query examples:

```http
GET /api/products/products/?tag=new
GET /api/products/products/?category=phones&brand=apple
GET /api/products/products/?search=iphone
GET /api/products/products/?min_price=100&max_price=500
GET /api/products/products/?featured=true&in_stock=true
GET /api/products/products/?has_discount=true
GET /api/products/products/?sort=price_asc
```

#### `POST /api/products/products/`

Request:

```json
{
  "category": 1,
  "brand": 1,
  "discounts": [1],
  "tags": [1, 2],
  "name": "iPhone 15",
  "description": "Flagship phone",
  "detail": "Full product detail",
  "base_price": "1000.00",
  "specification": {
    "screen": "6.1 inch",
    "storage": "128GB"
  },
  "is_active": true,
  "is_feature": true
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "category": 1,
  "category_detail": {
    "id": 1,
    "name": "Phones",
    "image": null,
    "slug": "phones",
    "is_active": true,
    "created_at": "2026-06-10T08:00:00Z",
    "updated_at": "2026-06-10T08:00:00Z"
  },
  "brand": 1,
  "brand_detail": {
    "id": 1,
    "name": "Apple",
    "image": null,
    "slug": "apple",
    "is_active": true,
    "created_at": "2026-06-10T08:00:00Z",
    "updated_at": "2026-06-10T08:00:00Z"
  },
  "discounts": [1],
  "discount_details": [],
  "tags": [1, 2],
  "tag_details": [],
  "name": "iPhone 15",
  "slug": "iphone-15",
  "description": "Flagship phone",
  "detail": "Full product detail",
  "base_price": "1000.00",
  "final_price": "900.00",
  "specification": {
    "screen": "6.1 inch",
    "storage": "128GB"
  },
  "is_active": true,
  "is_feature": true,
  "created_at": "2026-06-10T08:00:00Z",
  "updated_at": "2026-06-10T08:00:00Z",
  "medias": [],
  "videos": [],
  "option_groups": [],
  "variants": [],
  "free_items": []
}
```

Notes:

- `slug` is read-only and generated from `name`.
- `final_price` is read-only and computed.
- `discounts` accepts product-specific discount IDs only.
- Global discounts cannot be assigned directly to a product.
- Only one product-specific discount can be assigned.

Validation examples:

```json
{
  "discounts": "Global discounts apply automatically and cannot be assigned to a product."
}
```

```json
{
  "discounts": "Select only one product discount."
}
```

#### `GET /api/products/products/{id}/`

Returns full product detail.

Success `200 OK`:

```json
{
  "id": 1,
  "category": 1,
  "category_detail": {
    "id": 1,
    "name": "Phones",
    "image": null,
    "slug": "phones",
    "is_active": true,
    "created_at": "2026-06-10T08:00:00Z",
    "updated_at": "2026-06-10T08:00:00Z"
  },
  "brand": 1,
  "brand_detail": {
    "id": 1,
    "name": "Apple",
    "image": null,
    "slug": "apple",
    "is_active": true,
    "created_at": "2026-06-10T08:00:00Z",
    "updated_at": "2026-06-10T08:00:00Z"
  },
  "discounts": [1],
  "discount_details": [],
  "tags": [1],
  "tag_details": [],
  "name": "iPhone 15",
  "slug": "iphone-15",
  "description": "Flagship phone",
  "detail": "Full product detail",
  "base_price": "1000.00",
  "final_price": "900.00",
  "specification": {
    "screen": "6.1 inch"
  },
  "is_active": true,
  "is_feature": true,
  "created_at": "2026-06-10T08:00:00Z",
  "updated_at": "2026-06-10T08:00:00Z",
  "medias": [],
  "videos": [],
  "option_groups": [
    {
      "id": 1,
      "product": 1,
      "title": "Color",
      "options": [
        {
          "id": 1,
          "group": 1,
          "group_title": "Color",
          "value": "Black"
        }
      ]
    }
  ],
  "variants": [
    {
      "id": 1,
      "product": 1,
      "sku": "IPHONE-15-BLACK",
      "stock": 10,
      "price": "1000.00",
      "variant_final_price": "900.00",
      "image": null,
      "is_active": true,
      "created_at": "2026-06-10T08:00:00Z",
      "updated_at": "2026-06-10T08:00:00Z",
      "attributes": {
        "Color": "Black"
      },
      "variant_options": []
    }
  ],
  "free_items": []
}
```

#### `PATCH /api/products/products/{id}/`

Request:

```json
{
  "base_price": "950.00",
  "is_feature": false,
  "tags": [2]
}
```

Success response shape is the same as product detail.

#### `PUT /api/products/products/{id}/`

Full update request:

```json
{
  "category": 1,
  "brand": 1,
  "discounts": [1],
  "tags": [2],
  "name": "iPhone 15 Updated",
  "description": "Updated description",
  "detail": "Updated detail",
  "base_price": "950.00",
  "specification": {
    "screen": "6.1 inch"
  },
  "is_active": true,
  "is_feature": false
}
```

Success response shape is the same as product detail.

#### `DELETE /api/products/products/{id}/`

Success:

```text
204 No Content
```

### `/api/products/product-medias/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

#### `GET /api/products/product-medias/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "product": 1,
    "image": "http://localhost:8000/media/products/iphone.png",
    "is_thumbnail": true
  }
]
```

#### `POST /api/products/product-medias/`

Use `multipart/form-data`.

Request:

```json
{
  "product": 1,
  "image": "<file>",
  "is_thumbnail": true
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "product": 1,
  "image": "http://localhost:8000/media/products/iphone.png",
  "is_thumbnail": true
}
```

`GET {id}`, `PATCH {id}`, `PUT {id}`, and `DELETE {id}` follow the same pattern.

### `/api/products/product-videos/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

#### `GET /api/products/product-videos/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "product": 1,
    "video_url": "https://example.com/video.mp4",
    "is_main": true
  }
]
```

#### `POST /api/products/product-videos/`

Request:

```json
{
  "product": 1,
  "video_url": "https://example.com/video.mp4",
  "is_main": true
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "product": 1,
  "video_url": "https://example.com/video.mp4",
  "is_main": true
}
```

`GET {id}`, `PATCH {id}`, `PUT {id}`, and `DELETE {id}` follow the same pattern.

### `/api/products/option-groups/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

#### `GET /api/products/option-groups/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "product": 1,
    "title": "Color",
    "options": [
      {
        "id": 1,
        "group": 1,
        "group_title": "Color",
        "value": "Black"
      }
    ]
  }
]
```

#### `POST /api/products/option-groups/`

Request:

```json
{
  "product": 1,
  "title": "Color"
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "product": 1,
  "title": "Color",
  "options": []
}
```

`GET {id}`, `PATCH {id}`, `PUT {id}`, and `DELETE {id}` follow the same pattern.

### `/api/products/options/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

#### `GET /api/products/options/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "group": 1,
    "group_title": "Color",
    "value": "Black"
  }
]
```

#### `POST /api/products/options/`

Request:

```json
{
  "group": 1,
  "value": "Black"
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "group": 1,
  "group_title": "Color",
  "value": "Black"
}
```

`GET {id}`, `PATCH {id}`, `PUT {id}`, and `DELETE {id}` follow the same pattern.

### `/api/products/variants/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

#### `GET /api/products/variants/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "product": 1,
    "sku": "IPHONE-15-BLACK",
    "stock": 10,
    "price": "1000.00",
    "variant_final_price": "900.00",
    "image": null,
    "is_active": true,
    "created_at": "2026-06-10T08:00:00Z",
    "updated_at": "2026-06-10T08:00:00Z",
    "attributes": {
      "Color": "Black"
    },
    "variant_options": [
      {
        "id": 1,
        "variant": 1,
        "option": 1,
        "option_detail": {
          "id": 1,
          "group": 1,
          "group_title": "Color",
          "value": "Black"
        }
      }
    ]
  }
]
```

Public users only receive active variants for active products, categories, and brands.

#### `POST /api/products/variants/`

Use `multipart/form-data` when uploading `image`.

Request:

```json
{
  "product": 1,
  "sku": "IPHONE-15-BLACK",
  "stock": 10,
  "price": "1000.00",
  "image": "<file>",
  "is_active": true
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "product": 1,
  "sku": "IPHONE-15-BLACK",
  "stock": 10,
  "price": "1000.00",
  "variant_final_price": "900.00",
  "image": "http://localhost:8000/media/variants/iphone-black.png",
  "is_active": true,
  "created_at": "2026-06-10T08:00:00Z",
  "updated_at": "2026-06-10T08:00:00Z",
  "attributes": {},
  "variant_options": []
}
```

Read-only fields:

```text
id
variant_final_price
created_at
updated_at
attributes
variant_options
```

`GET {id}`, `PATCH {id}`, `PUT {id}`, and `DELETE {id}` follow the same pattern.

### `/api/products/variant-options/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

This connects a variant to a selected option.

#### `GET /api/products/variant-options/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "variant": 1,
    "option": 1,
    "option_detail": {
      "id": 1,
      "group": 1,
      "group_title": "Color",
      "value": "Black"
    }
  }
]
```

#### `POST /api/products/variant-options/`

Request:

```json
{
  "variant": 1,
  "option": 1
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "variant": 1,
  "option": 1,
  "option_detail": {
    "id": 1,
    "group": 1,
    "group_title": "Color",
    "value": "Black"
  }
}
```

Database rule:

```text
The same variant and option pair cannot be created twice.
```

`GET {id}`, `PATCH {id}`, `PUT {id}`, and `DELETE {id}` follow the same pattern.

### `/api/products/free-items/`

Auth:

- Read: public
- Write: currently allowed by the viewset unless project permissions are tightened

#### `GET /api/products/free-items/`

Success `200 OK`:

```json
[
  {
    "id": 1,
    "product": 1,
    "name": "Free Case",
    "image": "http://localhost:8000/media/free_items/free-case.png",
    "is_active": true
  }
]
```

Public users only receive active free items for active products.

#### `POST /api/products/free-items/`

Use `multipart/form-data` when uploading `image`.

Request:

```json
{
  "product": 1,
  "name": "Free Case",
  "image": "<file>",
  "is_active": true
}
```

Success `201 Created`:

```json
{
  "id": 1,
  "product": 1,
  "name": "Free Case",
  "image": "http://localhost:8000/media/free_items/free-case.png",
  "is_active": true
}
```

`GET {id}`, `PATCH {id}`, `PUT {id}`, and `DELETE {id}` follow the same pattern.

## Product List vs Detail

### List

```http
GET /api/products/products/
```

Uses `ProductListSerializer`.

Includes:

```text
id
category
category_detail
brand
brand_detail
discounts
discount_details
tags
tag_details
name
slug
base_price
final_price
is_active
is_feature
created_at
updated_at
medias
variants_count
```

Excludes heavy detail relations:

```text
variants
option_groups
videos
free_items
```

### Detail

```http
GET /api/products/products/{id}/
```

Uses `ProductSerializer`.

Includes full relations:

```text
medias
videos
option_groups
variants
free_items
```

## Product Query Params

Product list supports filtering and sorting:

```http
GET /api/products/products/?tag=new
```

### Supported Params

| Param | Example | Description |
| --- | --- | --- |
| `tag` | `?tag=new` | Filter by tag slug or exact tag name. Supports comma and repeated params. |
| `category` | `?category=phones` | Filter by category slug or ID. |
| `brand` | `?brand=apple` | Filter by brand slug or ID. |
| `search` | `?search=audio` | Search product name, description, detail, category name, brand name, tag name, and tag slug. |
| `q` | `?q=audio` | Alias for `search`. |
| `featured` | `?featured=true` | Filter by `is_feature`. |
| `active` | `?active=true` | Filter by `is_active`. Public users still cannot see inactive category/brand products. |
| `in_stock` | `?in_stock=true` | Filter products with at least one active variant where stock is greater than 0. |
| `min_price` | `?min_price=100` | Filter by `base_price >= min_price`. |
| `max_price` | `?max_price=500` | Filter by `base_price <= max_price`. |
| `has_discount` | `?has_discount=true` | Filter products that currently have an active product discount or global override discount. |
| `sort` | `?sort=price_asc` | Sort product list. |

Boolean params accept:

```text
true
false
1
0
yes
no
```

Tag examples:

```http
GET /api/products/products/?tag=new
GET /api/products/products/?tag=new,sale
GET /api/products/products/?tag=new&tag=sale
```

Sort values:

```text
newest
oldest
price_asc
price_desc
name_asc
name_desc
```

Combined example:

```http
GET /api/products/products/?category=accessories&brand=apple&tag=sale&min_price=100&max_price=500&sort=price_asc
```

Invalid params return `400 Bad Request`.

Example:

```http
GET /api/products/products/?featured=maybe
```

Response:

```json
{
  "featured": "Use true or false."
}
```

## Product Create Example

```http
POST /api/products/products/
```

Request:

```json
{
  "category": 1,
  "brand": 1,
  "discounts": [1],
  "tags": [1, 2],
  "name": "iPhone 15",
  "description": "Flagship phone",
  "detail": "Full product detail",
  "base_price": "1000.00",
  "specification": {
    "screen": "6.1 inch",
    "storage": "128GB"
  },
  "is_active": true,
  "is_feature": true
}
```

Important discount validation:

- Global discounts cannot be manually assigned to products.
- Only one product-specific discount can be assigned to a product.

## Discount Logic

Discounts can be product-specific or global.

Product-specific discount:

```text
is_global=False
```

Global discount:

```text
is_global=True
```

Global override discount:

```text
is_global=True
override_product_discount=True
```

Active discount requirements:

```text
is_active=True
start_date <= now
end_date >= now
```

Product discount selection:

1. Get active product-specific discounts assigned to the product.
2. Get active global discounts.
3. If any active global discount has `override_product_discount=True`, use global override discounts.
4. Else if the product has active product-specific discounts, use those.
5. Else use no discount.
6. When multiple candidate discounts exist, choose the discount with the biggest saving.

Final product price:

```text
final_price = base_price - selected_discount_amount
```

Percent discount:

```text
discount_amount = price * value / 100
```

Fixed discount:

```text
discount_amount = min(value, price)
```

Variant final price uses the same selected product discount but applies it to the variant price:

```text
variant_final_price = variant.price - selected_discount_amount_for_variant_price
```

## Public vs Admin Visibility

For these resources, public users only see active records:

```text
categories
brands
discounts
tags
products
variants
free_items
```

For products, public users only see products where:

```text
product.is_active=True
category.is_active=True
brand.is_active=True
```

Admins can see inactive records.

## Media Uploads

Image fields save into `media/`:

```text
categories/
brands/
banners/
products/
variants/
free_items/
```

During local development, media files are served because `setting/urls.py` appends:

```python
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

## Error Patterns

Validation errors usually return `400 Bad Request`.

Example:

```json
{
  "password": "Passwords do not match."
}
```

Authentication-protected endpoints return auth errors when the JWT is missing or invalid.

Admin-only endpoints require a valid user with:

```text
role=admin
```

## Testing

Run product tests:

```powershell
.\venv\Scripts\python.exe manage.py test apps.products.tests
```

Current product tests cover:

- Discount override behavior.
- Product list payload stays lightweight.
- Product detail includes full relations.
- Product tag create/list behavior.
- Product create with existing tag IDs.
- Product list query params.

## Development Notes

- Product list uses `select_related` for category/brand.
- Product list prefetches discounts, tags, and medias.
- Product list annotates `variants_count`.
- Product detail prefetches heavier relations only when needed.
- Product filters use `.distinct()` to avoid duplicate products from many-to-many joins.
- The project currently has no pagination configured globally.
- The project currently has no `django-filter` dependency; product query filtering is implemented directly in `ProductViewSet`.

## Production Checklist

Before production:

- Set `DEBUG=False`.
- Move `SECRET_KEY` to an environment variable.
- Move email credentials to environment variables.
- Configure `ALLOWED_HOSTS`.
- Use a strong PostgreSQL password and keep it outside version control.
- Configure static and media file hosting.
- Add proper logging.
- Add pagination for large product lists.
- Review permissions for write endpoints.
- Add refresh-token endpoints if the frontend needs refresh rotation directly.
- Do not commit generated `__pycache__` files.
