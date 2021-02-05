## Arquitetura da aplicação

Todo arquivo fora do diretório `src` será utilizado para configuração do ambiente de desenvolvimento (IDE) ou de execução do aplicativo. Dentro do diretório `src` encontra-se todo o código fonte da aplicação, dividido nos pacotes: `utils`, `errors`, `domain`, `infra`, `gateway`, `main` e `tests`. Cada um desses pacotes pode se comunicar de maneira específica com cada um dos outros, conforme será detalhado a seguir.

### Os pacotes `main` e `tests`

Estes são os pacotes superpoderosos da arquitetura, eles não conhecem um ao outro, mas conhecem todos os outros pacotes da aplicação. Ou seja, qualquer componente que esteja definido no pacote `tests`, por exemplo, poderá receber ou construir qualquer outro componente, definido em qualquer lugar, exceto no pacote `main` e usá-lo da maneira que desejar.

Por outro lado, nenhum dos outros pacotes pode saber sobre a existência destes dois pacotes e, de qualquer componente definido dentro de um deles. Ou seja, nunca importe nada do `main` fora do `main`, e nunca importe nada do `tests` fora do `tests`.

O propósito do pacote `tests` é reunir todos os testes automatizados que podem ser executados sobre a aplicação. E o propósito do pacote `main` é fornecer um ponto de entrada para a aplicação. Evite ao máximo colocar qualquer tipo de lógica da aplicação nestes pacotes, e sempre que alguma lógica for colocada neles refatore o mais rápido possível para levar essa lógica ao local adequado, antes que você perca todo o controle da sua arquitetura.

### Os pacotes `utils` e `errors`

Os pacotes `utils` e `errors` por outro, lado podem ser vistos como os grandes escravos da aplicação. Eles não devem conhecer nem uma parte da aplicação que esteja definida fora deles, exceto um ao outro, e serão conhecidos por todos.

Embora um componente do pacote `utils` possa construir ou receber outro componente do mesmo pacote ou do pacote `errors`, e vice-versa, esse procedimento deve ser utilizado com extrema cautela, pois poderá inserir um nível de acoplamento elevado, arruinando toda a arquitetura da aplicação. Sempre que isso parecer necessário, gaste algum tempo pensando se não existe um terceiro componente responsável por essa ligação antes de fazê-la diretamente.

O propósito do pacote `errors` é definir erros/exceções que podem ocorrer na sua aplicação, sejam eles causados por falha de equipamento, por entradas incorretas fornecidas pelo cliente/usuário, o por situações previstas mas não comuns de falha em uma lógica.

O propósito do pacote `utils` é fornecer funcionalidades básicas ao restante do sistema, que estejam mais próximas de uma extensão da linguagem do que de uma funcionalidade do aplicativo própriamente dita. Se o componente deste pacote não poderia ser utilizado em outros sistemas, provavelmente ele não deveria estar nesse pacote. Se o componente deste pacote produz algum efeito colateral (vide programação funcional) provavelmente ele também não deveria estar nesse pacote.

### O pacote `infra`

Aqui começamos entrar na "clean architecture", porém preciso chamar a atenção para uma diferença na interpretação que tenho sobre essa camada com relação ao que vejo outros desenvolvedores interpretando. O propósito da camada `infra` é ligar a aplicação a serviços de infraestrutura tais como: sistemas de persistência de dados (SQL, NoSQL, sistema de arquivos, etc), protocolos de comunicação de rede (HTTP, SMTP, TCP, UDP, etc), meios de comunicação com o usuário (interface web, interface mobile, comando de voz, api, etc), comunicação com outros sistemas/cloud, etc.

Portanto a camada `infra` não é a responsável por integrar o sistema com outras bibliotecas ou frameworks, algumas bibliotecas como bcrypt, por exemplo, poderiam ser integradas com o aplicativo através da camada `utils`, por exemplo, uma vez que ela fornece uma funcionalidade extra à linguagem e não está relacionada a nenhum serviço de infraestrutura.

O pacote `infra` será dividido em vários módulos, sendo que cada um poderá criar ou utilizar componentes específicos da aplicação. Porém, de uma forma geral, já podemos dizer que componentes de `infra` nunca enxergarão nada que esteja nos pacotes `main`, `tests` e `domain`. Antes de falar dos módulos deste pacote vamos olhar os outros dois pacotes.

### O pacote `domain`

O propósito do pacote `domain` é implementar toda a lógica da aplicação. Ele deverá ser dividido por módulos, onde cada módulo representa uma área da aplicação (ou se preferir chamar um domínio do negócio) e não conhece diretamente nenhum outro módulo.

Cada módulo se divide em duas camadas:
- `entities`: Reúne as entidades daquele módulo. Cada arquivo representa uma entidade, que não conhece nada além de `utils`, `errors` e das outras entidades do mesmo módulo. Uma entidade representa um tipo de dado usado naquele módulo, geralmente será definido como `interface` ou mesmo `type`, mas eventualmente pode ser definido como `class`. Embora cada entidade conheça as outras do mesmo módulo, esse conhecimento deve ser utilizado somente para obtenção de informação (leitura), nunca altere valores guardados por uma entidade através de outra (escrita).

- `usecases`: Reúne os casos de uso daquele módulo. Cada arquivo representa um caso de uso e poderá manipular qualquer entidade presente no seu módulo, criando ou alterando o que for necessário. Cada caso de uso pode ser entendido como uma pequena funcionalidade da aplicação. Ele conhece, além de `utils` e `errors`, `entities` e `usecases` do seu próprio módulo, mas não de outros módulos. Ele sempre será definido como `class`, embora possa definir outros tipos como `interface` ou `type` para indicar ao pacote `gateway` os seus requisitos ou formato de dados retornados por seus métodos principais.

### O pacote `gateway`

O pacote `gateway` é responsável por orquestrar o trabalho de todos os `usecases`,
provendo tudo o que cada usecase precisa para funcionar, seja implementando a funcionalidade requerida, seja obtendo a implementa quando de sua criação pelo pacote `infra` (que não é enxergado por ele) ou, seja pela utilização de outro usecase presente em um módulo diferente. Uma vez que esse pacote tem acesso aos `usecases` de todos os módulos do pacote `domain`, deve-se tomar cuidado especial para não criar dependências circulares entre os módulos.

Além disso, esse pacote deve ser dividido em duas partes:

- `data`: Seu ponto central é o diretório `factories` e sua responsabilidade é fornecer maneiras de criar `usecases`, atendendo a todos os seus requisitos. Para isso definirá quais funcionalidades de infraestrutura são necessárias, bem como quais tipos de dados serão recebidos e retornados. Todas essas definições ficarão nos diretórios `contracts` e `dto`.

- `presentation` que irá utilizar de fato as funcionalidades definidas pelos `usecases`. Portanto, embora ele conheça todos os `usecases`, não deverá criar nenhum, recebendo todos que precisar de fora. Ele está dividido nos diretórios:
  - `controllers`: Aqui cada arquivo será responsável por tratar um tipo requisição (definido por método e rota). Por isso ele terá um único método público cuja responsabilidade é extrair as informações requeridas pelo usecase do input recebido, validando o seu formato e repassando-as para o usecase e, retornar a resposta do usecase no formato adequado para apresentação.
  - `factories`: Aqui são definidas fábricas de controllers. A responsabilidade de cada classe é simplesmente construir o controller através de uma factory de cada usecase requerido pelo controller. Caso a fábrica já possua uma instância do controller esta será fornecida ao invés de construir uma nova, de forma transparente a quem a utiliza.
  - `contracts`: Arquivos que definem formatos de um controller genérico, bem como de entrada e retorno de seu método público.
  - `view`: Arquivos úteis para o controller converter os dados recebidos pelos usecases para os formatos adequados à sua apresentação.

Essas duas partes não devem se comunicar diretamente. Esta integração ficará a cargo do pacote `infra` que cria componentes de ambas as partes do `gateway`.

### Os componentes de infraestrutura e a amarração final

Como explicado anteriormente o pacote `infra` provê os serviços de infraestrutura para a aplicação. Ele se divide em módulos, mas não confunda estes módulos com os módulos da aplicação definidos no pacote `domain`. Um exemplo de módulo seria o `server`. Vejo muitos desenvolvedores colocando o `server` fora da camada de `infra`, às vezes no pacote `main`, mas entendo que ele seja um recurso de infraestrutura, que poderia inclusive deixar de existir se um dia eu decidisse transformar minha aplicação de web para desktop. Idealmente, o main deveria apenas importar o `server` do pacote `infra` e iniciá-lo adequadamente.

No caso específico desta aplicação, os módulos de infra utilizados são:
- `adapters`: Reúne alguns adaptadores úteis para a comunicação entre dois módulos do pacote ou um módulo do pacote com algum objeto do `gateway`. Não se trata exatamente de um módulo, mas apenas um agrupamento de utilitários para a pacote `infra`. Nenhum de seus componentes deve alterar diretamente outros objetos, mas apenas utilizar as informações contidas nestes.
- `api`: Responsável por definir as rotas da api com seus respectivos controllers. O recurso externo que ela deve tomar conta é o usuário, seja ele humano ou outro sistema.
- `data-source`: Responsável pela persistência das informações do sistema.
- `environment`: Responsável pelo ambiente onde o sistema será executado. Deve concentrar as informações sobre o ambiente necessárias ao funcionamento do sistema, sejam elas de persistência, dados do servidor, ou qualquer outra.
- `factories`: Responsável por centralizar a produção de tudo que se encontra no pacote `gateway` fornecendo instâncias para os módulos que desejarem utilizar. Constrói também instâncias de componentes do modulo `data-source`.
- `graphql`: Responsável pela aplicação graphql, reunindo suas configurações.
- `server`: Responsável por definir o servidor web (composto tanto por `api` quanto por `graphql`) com todos os controllers construídos por `factories`. Esse é o modulo será utilizado no `main` para iniciar a aplicação.

