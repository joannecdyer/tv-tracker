var AuthPickerContainer = React.createClass({
  mixins: [Reflux.listenToMany(AuthActions)],

  getInitialState: function () {
    return { formToShow: "SignUp" };
  },

  onShowLoginModal: function () {
    this.setState({ formToShow: "" });
    this.setState({ formToShow: "Login" });
    this.showModal();
  },

  onShowSignUpModal: function () {
    this.setState({ formToShow: "" });
    this.setState({ formToShow: "SignUp" });
    this.showModal();
  },

  changeFormToShow: function (newForm) {
    this.setState({
      formToShow: newForm
    });
  },

  showModal: function () {
    $('#modalAuth').modal('show');
  },

  render: function () {
    return (
      <AuthPicker formToShow={this.state.formToShow} onFormChange={this.changeFormToShow} />
    );
  }
});
