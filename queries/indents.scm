; Indent after opening braces
[
  (block)
  (agent_body)
  (match_expression)
  (match_statement)
  (divine_expression)
  (list_literal)
  (record_literal)
] @indent

; Dedent at closing braces
[
  "}"
  "]"
  ")"
] @dedent

; Indent for match arms
(match_arm "=>" @indent)
