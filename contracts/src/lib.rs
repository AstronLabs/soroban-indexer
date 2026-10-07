#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String
};

#[contracttype]
pub enum DataKey {
    Admin,
    Config(String),
}

#[contract]
pub struct IndexerDemoContract;

#[contractimpl]
impl IndexerDemoContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        let topics = (symbol_short!("init"),);
        env.events().publish(topics, admin);
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        // We skip actual balances logic since it's just a demo of events
        from.require_auth();
        
        let topics = (symbol_short!("transfer"), from.clone(), to.clone());
        env.events().publish(topics, amount);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let topics = (symbol_short!("mint"), to.clone());
        env.events().publish(topics, amount);
    }

    pub fn set_config(env: Env, key: String, value: String) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        env.storage().instance().set(&DataKey::Config(key.clone()), &value);

        let topics = (symbol_short!("config"), key);
        env.events().publish(topics, value);
    }

    pub fn batch_operation(env: Env, count: u32) {
        for i in 0..count {
            let topics = (symbol_short!("batch"), i);
            env.events().publish(topics, i * 100);
        }
    }
}

mod test;
