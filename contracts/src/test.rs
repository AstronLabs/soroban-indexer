#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Events}, Env, IntoVal, String, vec};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IndexerDemoContract);
    let client = IndexerDemoContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);

    client.initialize(&admin);

    let events = env.events().all();
    assert_eq!(events.len(), 1);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IndexerDemoContract);
    let client = IndexerDemoContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);

    client.initialize(&admin);
    client.initialize(&admin);
}

#[test]
fn test_transfer() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IndexerDemoContract);
    let client = IndexerDemoContractClient::new(&env, &contract_id);
    
    env.mock_all_auths();
    
    let from = Address::generate(&env);
    let to = Address::generate(&env);
    
    client.transfer(&from, &to, &1000);
    
    let events = env.events().all();
    assert_eq!(events.len(), 1);
}

#[test]
fn test_mint() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IndexerDemoContract);
    let client = IndexerDemoContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    client.initialize(&admin);
    
    env.mock_all_auths();
    
    let to = Address::generate(&env);
    client.mint(&to, &500);
    
    // 1 event for init, 1 for mint
    let events = env.events().all();
    assert_eq!(events.len(), 2);
}

#[test]
fn test_batch() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IndexerDemoContract);
    let client = IndexerDemoContractClient::new(&env, &contract_id);
    
    client.batch_operation(&5);
    
    let events = env.events().all();
    assert_eq!(events.len(), 5);
}
