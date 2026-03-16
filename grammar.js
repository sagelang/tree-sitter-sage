/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Sage grammar for syntax highlighting
// Updated for RFC-0018 keyword renames and RFC-0019 improvements

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
    [$.block, $.map_literal],
  ],

  rules: {
    source_file: $ => repeat($._definition),

    _definition: $ => choice(
      $.agent_declaration,
      $.function_declaration,
      $.record_declaration,
      $.enum_declaration,
      $.const_declaration,
      $.tool_declaration,
      $.mod_declaration,
      $.use_declaration,
      $.test_block,
      $.run_statement,
    ),

    // Comments
    line_comment: $ => seq('//', /.*/),
    block_comment: $ => seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),

    // Module system
    mod_declaration: $ => seq('mod', field('name', $.identifier), optional(';')),

    use_declaration: $ => seq(
      'use',
      $.use_path,
      optional(';'),
    ),

    use_path: $ => seq(
      $.identifier,
      repeat(seq('::', choice(
        $.identifier,
        $.use_group,
        '*',
      ))),
      optional(seq('as', $.identifier)),
    ),

    use_group: $ => seq('{', commaSep1($.use_path), '}'),

    // Const declaration
    const_declaration: $ => seq(
      optional('pub'),
      'const',
      field('name', $.identifier),
      ':',
      field('type', $._type),
      '=',
      $._expression,
      optional(';'),
    ),

    // Agent
    agent_declaration: $ => seq(
      optional('pub'),
      'agent',
      field('name', $.identifier),
      optional($.generic_params),
      optional($.receives_clause),
      $.agent_body,
    ),

    receives_clause: $ => seq('receives', $._type),

    agent_body: $ => seq('{', repeat($.agent_member), '}'),

    agent_member: $ => choice(
      $.tool_use_clause,
      $.field_declaration,
      $.handler_declaration,
    ),

    tool_use_clause: $ => seq('use', commaSep1($.identifier)),

    field_declaration: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
      optional(','),
    ),

    handler_declaration: $ => seq(
      'on',
      field('event', $.handler_event),
      $.block,
    ),

    handler_event: $ => choice(
      'start',
      'stop',
      seq('error', '(', optional($.identifier), ')'),
    ),

    // Test block
    test_block: $ => seq(
      optional($.test_attribute),
      'test',
      field('name', $.string),
      $.block,
    ),

    test_attribute: $ => seq('@', $.identifier),

    // Function
    function_declaration: $ => seq(
      optional('pub'),
      'fn',
      field('name', $.identifier),
      optional($.generic_params),
      $.parameter_list,
      optional(seq('->', field('return_type', $._type))),
      optional('fails'),
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
    run_statement: $ => seq('run', $.identifier, optional(';')),

    // Statements
    block: $ => seq('{', repeat($._statement), '}'),

    _statement: $ => choice(
      $.let_statement,
      $.return_statement,
      $.yield_statement,
      $.if_statement,
      $.for_statement,
      $.while_statement,
      $.loop_statement,
      $.match_statement,
      $.break_statement,
      $.continue_statement,
      $.mock_divine_statement,
      $.assert_statement,
      $.expression_statement,
    ),

    let_statement: $ => seq(
      'let',
      optional('mut'),
      choice(
        field('name', $.identifier),
        $.tuple_pattern,
      ),
      optional(seq(':', field('type', $._type))),
      '=',
      $._expression,
      optional(';'),
    ),

    tuple_pattern: $ => seq('(', commaSep1($.identifier), ')'),

    return_statement: $ => prec.right(seq('return', optional($._expression), optional(';'))),

    yield_statement: $ => seq('yield', '(', $._expression, ')', optional(';')),

    if_statement: $ => prec.right(seq(
      'if',
      $._expression,
      $.block,
      optional(seq('else', choice($.block, $.if_statement))),
    )),

    for_statement: $ => seq(
      'for',
      choice($.identifier, $.tuple_pattern),
      'in',
      $._expression,
      $.block,
    ),

    while_statement: $ => seq('while', $._expression, $.block),

    loop_statement: $ => seq('loop', $.block),

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

    break_statement: $ => seq('break', optional(';')),
    continue_statement: $ => seq('continue', optional(';')),

    // Mock divine for tests
    mock_divine_statement: $ => seq(
      'mock',
      'divine',
      '->',
      $._expression,
      optional(';'),
    ),

    // Assertions for tests
    assert_statement: $ => seq(
      choice(
        'assert',
        'assert_eq',
        'assert_neq',
        'assert_gt',
        'assert_lt',
        'assert_gte',
        'assert_lte',
        'assert_contains',
        'assert_starts_with',
        'assert_ends_with',
        'assert_empty',
        'assert_not_empty',
        'assert_true',
        'assert_false',
        'assert_fails',
      ),
      '(',
      commaSep($._expression),
      ')',
      optional(';'),
    ),

    expression_statement: $ => seq($._expression, optional(';')),

    // Expressions
    _expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.method_call_expression,
      $.field_expression,
      $.index_expression,
      $.divine_expression,
      $.summon_expression,
      $.send_expression,
      $.receive_expression,
      $.closure_expression,
      $.try_expression,
      $.try_catch_expression,
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
      $.map_literal,
      $.tuple_literal,
      $.record_literal,
      $.parenthesized_expression,
      $.self,
    ),

    self: $ => 'self',

    binary_expression: $ => choice(
      prec.left(1, seq($._expression, 'or', $._expression)),
      prec.left(2, seq($._expression, 'and', $._expression)),
      prec.left(3, seq($._expression, choice('==', '!='), $._expression)),
      prec.left(4, seq($._expression, choice('<', '>', '<=', '>='), $._expression)),
      prec.left(5, seq($._expression, '++', $._expression)),
      prec.left(6, seq($._expression, choice('+', '-'), $._expression)),
      prec.left(7, seq($._expression, choice('*', '/', '%'), $._expression)),
      prec.left(1, seq($._expression, choice('=', '+=', '-=', '*=', '/='), $._expression)),
      prec.right(8, seq($._expression, '??', $._expression)),
    ),

    unary_expression: $ => prec(9, choice(
      seq('-', $._expression),
      seq('!', $._expression),
    )),

    call_expression: $ => prec.left(11, seq(
      field('function', $._expression),
      optional($.turbofish),
      field('arguments', $.argument_list),
    )),

    argument_list: $ => seq('(', commaSep($._expression), ')'),

    turbofish: $ => seq('::', '<', commaSep1($._type), '>'),

    method_call_expression: $ => prec.left(11, seq(
      field('object', $._expression),
      '.',
      field('method', $.identifier),
      field('arguments', $.argument_list),
    )),

    field_expression: $ => prec.left(11, seq(
      $._expression,
      '.',
      choice($.identifier, $.integer),
    )),

    index_expression: $ => prec.left(11, seq(
      $._expression,
      '[',
      $._expression,
      ']',
    )),

    try_expression: $ => prec(10, seq('try', $._expression)),

    try_catch_expression: $ => prec(11, seq(
      'try',
      $._expression,
      'catch',
      $.block,
    )),

    await_expression: $ => prec(10, seq('await', $._expression)),

    divine_expression: $ => seq(
      'divine',
      '(',
      $._expression,
      ')',
    ),

    summon_expression: $ => prec.right(seq(
      'summon',
      $.identifier,
      optional($.record_body),
    )),

    record_body: $ => seq(
      '{',
      commaSep(choice(
        $.identifier,
        seq($.identifier, ':', $._expression),
      )),
      optional(','),
      '}',
    ),

    send_expression: $ => seq(
      'send',
      '(',
      $._expression,
      ',',
      $._expression,
      ')',
    ),

    receive_expression: $ => seq('receive', '(', ')'),

    closure_expression: $ => seq(
      '|',
      commaSep(seq($.identifier, optional(seq(':', $._type)))),
      '|',
      choice($.block, $._expression),
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    list_literal: $ => seq('[', commaSep($._expression), optional(','), ']'),

    map_literal: $ => seq('{', commaSep($.map_entry), optional(','), '}'),

    map_entry: $ => seq($._expression, ':', $._expression),

    tuple_literal: $ => seq('(', $._expression, ',', commaSep($._expression), optional(','), ')'),

    record_literal: $ => seq(
      $.identifier,
      $.record_body,
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
    function_type: $ => seq('Fn', '(', commaSep($._type), ')', '->', $._type),

    // Literals
    literal: $ => choice(
      $.integer,
      $.float,
      $.boolean,
      'None',
    ),

    integer: $ => /\d+/,
    float: $ => /\d+\.\d+/,
    boolean: $ => choice('true', 'false'),

    // Single-quoted strings (no interpolation)
    string: $ => seq("'", repeat(choice(/[^'\\]+/, $.escape_sequence)), "'"),

    // Double-quoted strings (with optional interpolation)
    interpolated_string: $ => seq(
      '"',
      repeat(choice(
        /[^"\\{]+/,
        $.escape_sequence,
        $.interpolation,
      )),
      '"',
    ),

    interpolation: $ => seq('{', $._expression, '}'),

    escape_sequence: $ => /\\[nrt"'\\{]/,

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
