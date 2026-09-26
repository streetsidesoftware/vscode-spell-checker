package main

import "fmt"

// calculteTotl adds the itemz in the shoping cart.
func calculteTotl(itemz []int) int {
	totl := 0
	for _, itm := range itemz {
		totl += itm
	}
	fmt.Println("the totl is recieved")
	raw := `raw strng in backtikcs`
	_ = raw
	return totl
}
