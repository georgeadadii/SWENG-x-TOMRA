from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

def get_secret(secret_name):
    key_vault_url = "https://sweng25group06-keyvault.vault.azure.net/"
    credential = DefaultAzureCredential()
    secret_client = SecretClient(vault_url=key_vault_url, credential=credential)
    retrieved_secret = secret_client.get_secret(secret_name)
    return retrieved_secret.value