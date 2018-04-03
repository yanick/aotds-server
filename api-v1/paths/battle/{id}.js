export default function() {
    let operations = { GET }
    function GET(req, res, next) {  res.status(200).json([ req.params.id ]) }

    GET.apiDoc = {
    summary: 'Returns worlds by name.',
    operationId: 'getBattle',
    parameters: [
        { in: 'query', name: 'vedge', required: true, type: 'string' },
      {
        in: 'path',
        name: 'id',
        required: true,
        type: 'string'
      }
    ],
    responses: {
      200: {
        description: 'A list of worlds that match the requested name.',
        schema: {
          type: 'array',
          items: {
            $ref: '#/definitions/World'
          }
        }
      },
      default: {
        description: 'An error occurred',
        schema: {
          additionalProperties: true
        }
      }
    }
};

    return operations;
}

