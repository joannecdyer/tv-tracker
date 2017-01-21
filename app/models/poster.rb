class Poster < ApplicationRecord
  belongs_to :programme_info
  validates :programme_info, :tvdb_ref, presence: true
  validates :tvdb_ref, uniqueness: true

  def self.create_from_tvdb(programme_info)
    response = TheTVDB.posters(programme_info.tvdb_ref)
    if response.include?('data')
      data = response['data']
      data.each do |item|
        programme_info.posters.build({
          tvdb_ref: item['id'],
          thumbnail: item['thumbnail'],
          rating_average: item['ratingsInfo']['average']
        })
      end
    end
  end

  def self.update_from_tvdb(programme_info)
    response = TheTVDB.posters(programme_info.tvdb_ref)
    if response.include?('data')
      data = response['data']
      to_delete = []
      programme_info.posters.each do |current|
        delete = true
        data.each do |item|
          if item['id'] == current.tvdb_ref
            delete = false
            break
          end
        end
        to_delete << current if delete
      end
      to_delete.each do |poster_to_delete|
        obj = S3_BUCKET.objects[poster_to_delete.tvdb_ref.to_s]
        obj.delete
        poster_to_delete.destroy
      end

      data.each do |item|
        search = Poster.where(tvdb_ref: item['id'])
        if search.length > 0
          posterObject = search[0]
          originalThumbnail = posterObject.thumbnail
          posterObject.update({
            thumbnail: item['thumbnail'],
            rating_average: item['ratingsInfo']['average']
          })
          if posterObject.thumbnail != originalThumbnail
            UploadImageWorker.perform_async(posterObject.id)
          end
        else
          poster = programme_info.posters.create({
            tvdb_ref: item['id'],
            thumbnail: item['thumbnail'],
            rating_average: item['ratingsInfo']['average']
          })
          UploadImageWorker.perform_async(poster.id)
        end
      end
    end
  end

  def upload_image
    download = open('https://thetvdb.com/banners/' + self.thumbnail)
    obj = S3_BUCKET.object(self.tvdb_ref.to_s)
    obj.upload_file(download)
    self.update({
      url: obj.public_url
    })
  end
end
