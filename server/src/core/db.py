from src.core.secret import get_secrets


def get_connection():
    import psycopg
    from psycopg.rows import dict_row

    return psycopg.connect(conninfo=get_secrets()["neon_db_uri"], row_factory=dict_row)
