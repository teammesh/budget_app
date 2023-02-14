import os
import pandas as pd
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

group_id = "019d9863-91dd-433a-8f5a-b8847cacda5d"
user_ids = ["3e1e4eb4-cb1b-4ddf-826b-697a58df1e1a", "e15f3138-111f-48a1-b4b6-5b4122b782ee", "e93533a6-9cd7-4886-857c-4120fc98292f"]

dataframe = pd.read_excel("./austin.xlsx")

for index, row in dataframe.iterrows():
    charged_to = row["charged_to"]
    amount = row["Amount"] * -1  # Flip value since app uses positive values
    date = row["Transaction Date"]
    name = row["Description"]
    category = row["Category"]
    notes = row["Memo"]

    # Equally split for now, handle adjustments in the app
    split_amount = round(amount / 3, 2)
    split_amounts = {
       "3e1e4eb4-cb1b-4ddf-826b-697a58df1e1a": split_amount,
       "e15f3138-111f-48a1-b4b6-5b4122b782ee": split_amount,
       "e93533a6-9cd7-4886-857c-4120fc98292f": split_amount
    }
    data = (
        supabase.table("shared_transactions")
        .insert(
            {
                "account_id": charged_to,
                "group_id": group_id,
                "charged_to": charged_to,
                "amount": amount,
                "date": date.strftime('%Y-%m-%d'),
                "category": '{' + category + '}',
                "name": name,
                "notes": notes if isinstance(notes, str) else '',
                "split_amounts": split_amounts,
            }
        )
        .execute()
    )
