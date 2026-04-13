#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol};

const NEXT_ID: Symbol = symbol_short!("NEXT_ID");

#[derive(Clone)]
#[contracttype]
pub struct Vault {
    pub id: u32,
    pub owner: Address,
    pub title: String,
    pub asset: Symbol,
    pub target_amount: i128,
    pub saved_amount: i128,
    pub target_date: u64,
    pub cadence: Symbol,
    pub status: Symbol,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Vault(u32),
}

#[contract]
pub struct GoalVaultContract;

#[contractimpl]
impl GoalVaultContract {
    pub fn create_vault(
        env: Env,
        owner: Address,
        title: String,
        asset: Symbol,
        target_amount: i128,
        target_date: u64,
        cadence: Symbol,
    ) -> u32 {
        owner.require_auth();

        let id = env.storage().persistent().get(&NEXT_ID).unwrap_or(0u32);
        let vault = Vault {
            id,
            owner,
            title,
            asset,
            target_amount,
            saved_amount: 0,
            target_date,
            cadence,
            status: symbol_short!("OPEN"),
        };

        env.storage().persistent().set(&DataKey::Vault(id), &vault);
        env.storage().persistent().set(&NEXT_ID, &(id + 1));
        id
    }

    pub fn contribute(env: Env, vault_id: u32, amount: i128) -> Vault {
        let mut vault: Vault = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .unwrap();

        vault.saved_amount += amount;

        if vault.saved_amount >= vault.target_amount {
            vault.status = symbol_short!("READY");
        }

        env.storage().persistent().set(&DataKey::Vault(vault_id), &vault);
        vault
    }

    pub fn get_vault(env: Env, vault_id: u32) -> Vault {
        env.storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .unwrap()
    }
}
