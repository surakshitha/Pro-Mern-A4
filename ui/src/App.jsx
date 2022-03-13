/* eslint-disable react/jsx-no-target-blank */
/* eslint "react/jsx-no-undef": "off" */
/* globals React ReactDOM */

function ProductRow(props) {
  const { product } = props;
  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.price ? `$${product.price}` : ''}</td>
      <td>{product.category}</td>
      <td>{product.image ? <a href={product.image} target="_blank">Link</a> : ''}</td>
    </tr>
  );
}

function ProductTable({ products }) {
  const productRows = products.map(product => <ProductRow key={product.id} product={product} />);

  return (
    <table className="bordered-table">
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Price</th>
          <th>Category</th>
          <th>Image</th>
        </tr>
      </thead>
      <tbody>
        {productRows.length > 0 ? productRows : <tr><td colSpan="4">No records to display</td></tr>}
      </tbody>
    </table>
  );
}

async function graphQLFetch(query, variables = {}) {
  const response = await fetch(window.ENV.UI_API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const body = await response.text();
  const result = JSON.parse(body);

  return result.data;
}

class ProductAdd extends React.Component {
  constructor() {
    super();
    this.state = { value: '$' };
    this.handlePriceChange = this.handlePriceChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handlePriceChange(e) {
    const priceValue = e.target.value.substring(1);
    this.setState({ value: `$${priceValue}` });
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.productAdd;
    const product = {
      category: form.productCategory.value,
      price: form.productPrice.value ? parseFloat(form.productPrice.value.substring(1)) : null,
      name: form.productname.value != null || form.productname.value !== '' ? form.productname.value : null,
      image: form.productimage.value,
    };
    const { createProduct } = this.props;
    createProduct(product);
    form.productCategory.value = 'Shirts';
    this.setState({ value: '$' });
    form.productname.value = '';
    form.productimage.value = '';
  }

  render() {
    const product = this.state;
    return (
      <form name="productAdd" onSubmit={this.handleSubmit}>
        <table className="productAddTable">
          <tbody>
            <tr>
              <td className="labels">Category</td>
              <td className="labels">Price Per Unit</td>
            </tr>
            <tr>
              <td>
                <select id="productcategory" name="productCategory" className="inputs" defaultValue="">
                  <option value="" disabled>Choose Category</option>
                  <option value="Shirts">Shirts</option>
                  <option value="Jeans">Jeans</option>
                  <option value="Jackets">Jackets</option>
                  <option value="Sweaters">Sweaters</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </td>
              <td>
                <input type="text" id="productprice" name="productPrice" value={product.value} onChange={this.handlePriceChange} className="inputs" />
              </td>
            </tr>
            <tr>
              <td className="labels">Product Name</td>
              <td className="labels">Image URL</td>
            </tr>
            <tr>
              <td><input type="text" name="productname" placeholder="Product Name" className="inputs" /></td>
              <td><input type="text" name="productimage" placeholder="Image URL" className="inputs" /></td>
            </tr>
          </tbody>
        </table>
        <button type="submit">Add Product</button>
      </form>
    );
  }
}

class ProductList extends React.Component {
  constructor() {
    super();
    this.state = { products: [] };
    this.createProduct = this.createProduct.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
            productList {
                id
                category
                price
                name
                image
            }
        }
        `;
    const data = await graphQLFetch(query);
    this.setState({ products: data.productList });
  }

  async createProduct(product) {
    const query = `mutation productAdd($product: ProductInputs!) {
            productAdd(product: $product){
                id
            }
        }`;

    const data = await graphQLFetch(query, { product });
    if (data) {
      this.loadData();
    }
  }

  render() {
    const { products } = this.state;
    return (
      <React.Fragment>
        <h1>My Company Inventory</h1>
        Showing all available products
        <hr />
        <ProductTable products={products} />
        <br />
        Add a new product to inventory
        <hr />
        <ProductAdd createProduct={this.createProduct} />
      </React.Fragment>
    );
  }
}

const inventoryAppDiv = document.getElementById('inventory-app');
ReactDOM.render(<ProductList />, inventoryAppDiv);
