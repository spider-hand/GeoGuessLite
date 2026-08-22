from http import HTTPStatus

from pydantic import ValidationError

from src.core.firebase import get_firebase_app
from src.core.http import ApiError
from src.features.users.models import CreateUserInput, CurrentUserRecord, UpdateUserInput, UserRecord
from src.features.users.repository import UsersRepository


def _public_profile(user: CurrentUserRecord) -> UserRecord:
    return UserRecord.model_validate(
        {
            "userId": user.user_id,
            "displayName": user.display_name,
            "country": user.country,
            "createdAt": user.created_at,
            "updatedAt": user.updated_at,
        }
    )


class UsersService:
    def __init__(self, users_repository: UsersRepository | None = None):
        self.users_repository = users_repository or UsersRepository()

    def get_user(self, user_id: str) -> UserRecord:
        user = self.users_repository.get_by_id(user_id)
        if user is None:
            raise ApiError(HTTPStatus.NOT_FOUND, "user_not_found", "User was not found.")
        return user

    def get_current_user(self, user_id: str) -> CurrentUserRecord:
        user = self.users_repository.get_current_by_id(user_id)
        if user is None:
            raise ApiError(HTTPStatus.NOT_FOUND, "user_not_found", "User was not found.")
        return user

    def create_user(self, user_id: str, payload: dict[str, object]) -> tuple[UserRecord, int]:
        existing_user = self.users_repository.get_by_id(user_id)
        if existing_user is not None:
            return existing_user, HTTPStatus.OK

        try:
            user_input = CreateUserInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                HTTPStatus.BAD_REQUEST,
                "invalid_request_body",
                "displayName must contain 1-50 characters and country must be a 2-letter code when provided.",
            ) from error

        return (
            self.users_repository.create(user_id, user_input.display_name, user_input.country),
            HTTPStatus.CREATED,
        )

    def update_user(self, user_id: str, payload: dict[str, object]) -> UserRecord:
        existing_user = self.get_current_user(user_id)

        try:
            user_input = UpdateUserInput.model_validate(payload)
            fields = user_input.model_fields_set
            if not fields or ("display_name" in fields and user_input.display_name is None) or (
                "distance_unit" in fields and user_input.distance_unit is None
            ):
                raise ValueError
        except (ValidationError, ValueError) as error:
            raise ApiError(
                HTTPStatus.BAD_REQUEST,
                "invalid_request_body",
                "Provide displayName, country, or distanceUnit with valid values.",
            ) from error

        display_name = user_input.display_name if "display_name" in fields else existing_user.display_name
        country = user_input.country if "country" in fields else existing_user.country
        distance_unit = user_input.distance_unit if "distance_unit" in fields else existing_user.distance_unit

        if (
            display_name == existing_user.display_name
            and country == existing_user.country
            and distance_unit == existing_user.distance_unit
        ):
            return _public_profile(existing_user)

        updated_user = self.users_repository.update(user_id, display_name, country, distance_unit)
        if updated_user is None:
            raise ApiError(HTTPStatus.NOT_FOUND, "user_not_found", "User was not found.")
        return updated_user

    def delete_user(self, user_id: str) -> None:
        from firebase_admin import auth as firebase_auth

        self.users_repository.delete(user_id)
        try:
            firebase_auth.delete_user(user_id, app=get_firebase_app())
        except firebase_auth.UserNotFoundError:
            pass
