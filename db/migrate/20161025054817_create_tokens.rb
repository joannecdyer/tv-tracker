class CreateTokens < ActiveRecord::Migration[5.0]
  def change
    create_table :tokens do |t|
      t.string :text
      t.datetime :refreshed

      t.timestamps
    end
  end
end
