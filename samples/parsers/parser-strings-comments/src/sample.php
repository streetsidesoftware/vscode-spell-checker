<?php
// A coment about the shoping cart.
function calculte_totl(array $itemz): int {
    $greeting = "Helo {$itemz[0]} itemz";
    $text = <<<EOT
    A heredoc with a mispeled word.
    EOT;
    return array_sum($itemz);
}
