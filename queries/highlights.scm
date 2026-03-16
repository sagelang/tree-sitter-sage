; Sage syntax highlighting
; RFC-0019 compliant

; =============================================================================
; Comments
; =============================================================================

(line_comment) @comment
(block_comment) @comment

; =============================================================================
; Keywords
; =============================================================================

; Agent keywords
"agent" @keyword
"on" @keyword
"receives" @keyword

; Function keywords
"fn" @keyword
"return" @keyword
"fails" @keyword

; Type definition keywords
"record" @keyword
"enum" @keyword
"tool" @keyword
"const" @keyword

; Module keywords
"mod" @keyword
"use" @keyword
"as" @keyword
"pub" @keyword

; Variable keywords
"let" @keyword
"mut" @keyword

; Agent runtime keywords
"run" @keyword
"summon" @keyword
"yield" @keyword
"divine" @keyword
"send" @keyword
"receive" @keyword

; Control flow keywords
"if" @keyword.control
"else" @keyword.control
"for" @keyword.control
"in" @keyword.control
"while" @keyword.control
"loop" @keyword.control
"match" @keyword.control
"break" @keyword.control
"continue" @keyword.control

; Error handling keywords
"try" @keyword.control
"catch" @keyword.control
"await" @keyword.control

; Testing keywords
"test" @keyword
"mock" @keyword

; Logical operators as keywords
"and" @keyword.operator
"or" @keyword.operator

; =============================================================================
; Handler events
; =============================================================================

(handler_event) @keyword

; =============================================================================
; Built-in types
; =============================================================================

((identifier) @type.builtin
 (#match? @type.builtin "^(String|Int|Float|Bool|Unit|List|Map|Option|Result|Oracle|Fn)$"))

; =============================================================================
; Type annotations
; =============================================================================

(parameter type: (identifier) @type)
(record_field type: (identifier) @type)
(field_declaration type: (identifier) @type)
(let_statement type: (identifier) @type)
(const_declaration type: (identifier) @type)
(function_declaration return_type: (identifier) @type)

; Generic types
(generic_type (identifier) @type)
(generic_params (identifier) @type)

; =============================================================================
; Declaration names
; =============================================================================

; Type names (agents, records, enums, tools)
(agent_declaration name: (identifier) @type)
(record_declaration name: (identifier) @type)
(enum_declaration name: (identifier) @type)
(tool_declaration name: (identifier) @type)

; Function names
(function_declaration name: (identifier) @function)
(tool_function name: (identifier) @function)

; =============================================================================
; Enum variants
; =============================================================================

(enum_variant name: (identifier) @constant)

; =============================================================================
; Fields and properties
; =============================================================================

(field_declaration name: (identifier) @property)
(record_field name: (identifier) @property)
(field_expression (identifier) @property)

; Map entry keys (when identifier)
; (map_entry key: (identifier) @property)

; =============================================================================
; Parameters
; =============================================================================

(parameter name: (identifier) @variable.parameter)
(handler_event (identifier) @variable.parameter)

; =============================================================================
; Constants
; =============================================================================

(const_declaration name: (identifier) @constant)

; =============================================================================
; Built-in values
; =============================================================================

(boolean) @constant.builtin
"None" @constant.builtin

; =============================================================================
; Self
; =============================================================================

(self) @variable.builtin

; =============================================================================
; Function calls
; =============================================================================

; Simple function calls: foo()
(call_expression
  function: (identifier) @function.call)

; Method calls: obj.method()
(method_call_expression
  method: (identifier) @function.call)

; Built-in functions
((identifier) @function.builtin
 (#match? @function.builtin "^(print|str|len|push|pop|map_get|map_set|map_has|map_delete|map_keys|map_values|int_to_str|Some|Ok|Err)$"))

; =============================================================================
; Assertions (test functions)
; =============================================================================

[
  "assert"
  "assert_eq"
  "assert_neq"
  "assert_gt"
  "assert_lt"
  "assert_gte"
  "assert_lte"
  "assert_contains"
  "assert_starts_with"
  "assert_ends_with"
  "assert_empty"
  "assert_not_empty"
  "assert_true"
  "assert_false"
  "assert_fails"
] @function.builtin

; =============================================================================
; Module paths
; =============================================================================

(use_path (identifier) @module)
(mod_declaration name: (identifier) @module)

; =============================================================================
; Tool use clause
; =============================================================================

(tool_use_clause (identifier) @type)

; =============================================================================
; Summon expression (agent type)
; =============================================================================

(summon_expression (identifier) @type)

; =============================================================================
; Test names
; =============================================================================

(test_block name: (string) @string.special)
(test_attribute (identifier) @attribute)

; =============================================================================
; Variables (fallback - should be last for identifiers)
; =============================================================================

(identifier) @variable

; =============================================================================
; Operators
; =============================================================================

"+" @operator
"-" @operator
"*" @operator
"/" @operator
"%" @operator
"=" @operator
"==" @operator
"!=" @operator
"<" @operator
">" @operator
"<=" @operator
">=" @operator
"!" @operator
"=>" @operator
"->" @operator
"++" @operator
"??" @operator
"::" @operator

; =============================================================================
; Punctuation
; =============================================================================

"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"|" @punctuation.bracket
":" @punctuation.delimiter
"," @punctuation.delimiter
"." @punctuation.delimiter
";" @punctuation.delimiter

; =============================================================================
; Literals
; =============================================================================

(integer) @number
(float) @number

; =============================================================================
; Strings
; =============================================================================

(string) @string
(interpolated_string) @string
(escape_sequence) @string.escape

; String interpolation braces
(interpolation
  "{" @punctuation.special
  "}" @punctuation.special)
