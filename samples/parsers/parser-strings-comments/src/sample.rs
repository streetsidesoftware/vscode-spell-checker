/// Doc coment: adds the itemz in the shoping cart.
fn calculte_totl(itemz: &[i32]) -> i32 {
    // a line coment with a mispeled word
    let msg = "the totl is recieved";
    let raw = r#"raw strng with "quotez""#;
    println!("{msg} {raw}");
    itemz.iter().sum()
}
