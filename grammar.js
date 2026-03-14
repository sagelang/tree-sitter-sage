/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Simplified grammar focused on syntax highlighting rather than perfect parsing

module.exports = grammar({
  name: 'sage',

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$._primary, $.record_literal],
    [$._type, $.function_type],
    [$.match_statement, $.match_expression],
    [$.if_statement, $.if_expression],
  ],

  rules: {
    source_file: $ => repeat($._definition),

    _definition: $ => choice(
      $.agent_declaration,
      $.function_declaration,
      $.record_declaration,
      $.enum_declaration,
      $.tool_declaration,
      $.run_statement,
    ),

    // Comments
    line_comment: $ => seq('//', /.*/),
    block_comment: $ => seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),

    // Agent
    agent_declaration: $ => seq(
      optional('pub'),
      'agent',
      field('name', $.identifier),
      optional($.generic_params),
      $.agent_body,
    ),

    agent_body: $ => seq('{', repeat($.agent_member), '}'),

    agent_member: $ => choice(
      $.use_clause,
      $.belief_declaration,
      $.handler_declaration,
    ),

    use_clause: $ => seq('use', commaSep1($.identifier)),

    belief_declaration: $ => seq(
      optional('pub'),
      'belief',
      field('name', $.identifier),
      ':',
      field('type', $._type),
      '=',
      $._expression,
    ),

    handler_declaration: $ => seq(
      'on',
      field('event', $.handler_event),
      $.block,
    ),

    handler_event: $ => choice(
      'start',
      'stop',
      seq('message', '(', optional($.identifier), ')'),
      seq('interval', '(', $._expression, ')'),
      seq('change', '(', $.identifier, ')'),
    ),

    // Function
    function_declaration: $ => seq(
      optional('pub'),
      'fn',
      field('name', $.identifier),
      optional($.generic_params),
      $.parameter_list,
      optional(seq('->', field('return_type', $._type))),
      $.block,
    ),

    parameter_list: $ => seq('(', commaSep($.parameter), ')'),

    parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    generic_params: $ => seq('<', commaSep1($.identifier), '>'),

    // Record
    record_declaration: $ => seq(
      optional('pub'),
      'record',
      field('name', $.identifier),
      optional($.generic_params),
      '{',
      commaSep($.record_field),
      optional(','),
      '}',
    ),

    record_field: $ => seq(
      optional('pub'),
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    // Enum
    enum_declaration: $ => seq(
      optional('pub'),
      'enum',
      field('name', $.identifier),
      optional($.generic_params),
      '{',
      commaSep($.enum_variant),
      optional(','),
      '}',
    ),

    enum_variant: $ => seq(
      field('name', $.identifier),
      optional(choice(
        seq('(', commaSep($._type), ')'),
        seq('{', commaSep($.record_field), optional(','), '}'),
      )),
    ),

    // Tool
    tool_declaration: $ => seq(
      optional('pub'),
      'tool',
      field('name', $.identifier),
      '{',
      repeat($.tool_function),
      '}',
    ),

    tool_function: $ => seq(
      'fn',
      field('name', $.identifier),
      $.parameter_list,
      optional(seq('->', field('return_type', $._type))),
    ),

    // Run
    run_statement: $ => seq('run', $._expression, optional(';')),

    // Statements
    block: $ => seq('{', repeat($._statement), '}'),

    _statement: $ => choice(
      $.let_statement,
      $.return_statement,
      $.emit_statement,
      $.if_statement,
      $.for_statement,
      $.while_statement,
      $.match_statement,
      $.break_statement,
      $.continue_statement,
      $.expression_statement,
    ),

    let_statement: $ => seq(
      'let',
      optional('mut'),
      field('name', $.identifier),
      optional(seq(':', field('type', $._type))),
      '=',
      $._expression,
    ),

    return_statement: $ => prec.right(seq('return', optional($._expression))),

    emit_statement: $ => seq('emit', '(', $._expression, ')'),

    if_statement: $ => prec.right(seq(
      'if',
      $._expression,
      $.block,
      optional(seq('else', choice($.block, $.if_statement))),
    )),

    for_statement: $ => seq('for', $.identifier, 'in', $._expression, $.block),

    while_statement: $ => seq('while', $._expression, $.block),

    match_statement: $ => seq(
      'match',
      $._expression,
      '{',
      repeat($.match_arm),
      '}',
    ),

    match_arm: $ => seq(
      $.pattern,
      optional(seq('if', $._expression)),
      '=>',
      choice($._expression, $.block),
      optional(','),
    ),

    pattern: $ => choice(
      $.identifier,
      '_',
      $.literal,
      $.string,
      seq($.identifier, '(', commaSep($.pattern), ')'),
      seq($.identifier, '{', commaSep($.field_pattern), optional(','), '}'),
    ),

    field_pattern: $ => choice(
      $.identifier,
      seq($.identifier, ':', $.pattern),
    ),

    break_statement: $ => 'break',
    continue_statement: $ => 'continue',

    expression_statement: $ => seq($._expression, optional(';')),

    // Expressions - simplified
    _expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.method_call_expression,
      $.field_expression,
      $.index_expression,
      $.infer_expression,
      $.closure_expression,
      $.try_expression,
      $.await_expression,
      $.if_expression,
      $.match_expression,
      $._primary,
    ),

    if_expression: $ => prec.right(seq(
      'if',
      $._expression,
      $.block,
      'else',
      choice($.block, $.if_expression),
    )),

    match_expression: $ => seq(
      'match',
      $._expression,
      '{',
      repeat($.match_arm),
      '}',
    ),

    _primary: $ => choice(
      $.identifier,
      $.literal,
      $.string,
      $.interpolated_string,
      $.list_literal,
      $.record_literal,
      $.parenthesized_expression,
    ),

    binary_expression: $ => choice(
      prec.left(1, seq($._expression, 'or', $._expression)),
      prec.left(2, seq($._expression, 'and', $._expression)),
      prec.left(3, seq($._expression, choice('==', '!='), $._expression)),
      prec.left(4, seq($._expression, choice('<', '>', '<=', '>='), $._expression)),
      prec.left(5, seq($._expression, choice('+', '-'), $._expression)),
      prec.left(6, seq($._expression, choice('*', '/', '%'), $._expression)),
      prec.left(1, seq($._expression, choice('=', '+=', '-=', '*=', '/='), $._expression)),
      prec.right(7, seq($._expression, '??', $._expression)),
    ),

    unary_expression: $ => prec(8, choice(
      seq('-', $._expression),
      seq('!', $._expression),
    )),

    call_expression: $ => prec.left(10, seq(
      $._expression,
      '(',
      commaSep($._expression),
      ')',
    )),

    method_call_expression: $ => prec.left(10, seq(
      $._expression,
      '.',
      $.identifier,
      '(',
      commaSep($._expression),
      ')',
    )),

    field_expression: $ => prec.left(10, seq(
      $._expression,
      '.',
      $.identifier,
    )),

    index_expression: $ => prec.left(10, seq(
      $._expression,
      '[',
      $._expression,
      ']',
    )),

    try_expression: $ => prec(9, seq('try', $._expression)),
    await_expression: $ => prec(9, seq('await', $._expression)),

    infer_expression: $ => seq(
      'infer',
      optional(seq('<', $._type, '>')),
      '{',
      repeat(choice(
        seq('prompt', ':', $._expression),
        seq('example', ':', '{', optional(seq('input', ':', $._expression)), 'output', ':', $._expression, '}'),
        seq('constraint', ':', $._expression),
      )),
      '}',
    ),

    closure_expression: $ => seq(
      '|',
      commaSep(seq($.identifier, optional(seq(':', $._type)))),
      '|',
      choice($.block, $._expression),
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    list_literal: $ => seq('[', commaSep($._expression), optional(','), ']'),

    record_literal: $ => seq(
      $.identifier,
      '{',
      commaSep(choice(
        $.identifier,
        seq($.identifier, ':', $._expression),
      )),
      optional(','),
      '}',
    ),

    // Types
    _type: $ => choice(
      $.identifier,
      $.generic_type,
      $.list_type,
      $.map_type,
      $.tuple_type,
      $.function_type,
      seq($._type, '?'),
      seq($._type, '!'),
    ),

    generic_type: $ => prec(1, seq($.identifier, '<', commaSep1($._type), '>')),
    list_type: $ => seq('[', $._type, ']'),
    map_type: $ => seq('{', $._type, ':', $._type, '}'),
    tuple_type: $ => seq('(', $._type, ',', commaSep1($._type), ')'),
    function_type: $ => seq('fn', '(', commaSep($._type), ')', '->', $._type),

    // Literals
    literal: $ => choice(
      $.integer,
      $.float,
      $.boolean,
      'none',
    ),

    integer: $ => /\d+/,
    float: $ => /\d+\.\d+/,
    boolean: $ => choice('true', 'false'),

    string: $ => seq('"', repeat(choice(/[^"\\]+/, $.escape_sequence)), '"'),

    interpolated_string: $ => seq(
      'f"',
      repeat(choice(
        /[^"\\{]+/,
        $.escape_sequence,
        seq('{', $._expression, '}'),
      )),
      '"',
    ),

    escape_sequence: $ => /\\[nrt"\\{]/,

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
